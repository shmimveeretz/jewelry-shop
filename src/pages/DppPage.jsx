import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageFrame, {
  LoadingState,
  MessageState,
  PageFooter,
} from "../features/dpp/components/PageFrame";
import BlockRenderer from "../features/dpp/BlockRenderer";
import { useDppState } from "../features/dpp/useDppState";
import { usePopupRegistry } from "../features/popups/PopupProvider";
import { applyPageMeta, setJsonLd, productJsonLd, SITE_URL } from "../utils/pageMeta";
import { trackEvent, productEventPayload } from "../utils/tracking";
import {
  getDppBootstrap,
  getDppPreview,
  readInjectedDppState,
} from "../services/dppApi";

/**
 * Dedicated Product Page. Assembled from admin-defined blocks.
 *
 * Deliberately isolated from the storefront: no navbar, no footer links, no
 * cart drawer, one path forward (the CTA). App.jsx strips the site chrome for
 * /lp/* routes. Hebrew-only by design — these pages serve Israeli paid traffic.
 *
 * The happy path never shows a spinner: the Netlify edge function has already
 * injected the payload into the HTML, so the first render is the real page.
 * The fetch below only runs for client-side navigation, local dev, or when the
 * edge fetch failed.
 */
function DppPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get("previewToken");

  // Read once, before the first paint. Consuming it twice would return null
  // the second time, since reading clears the global.
  const [injected] = useState(() =>
    previewToken ? null : readInjectedDppState(slug),
  );

  const [data, setData] = useState(injected);
  const [status, setStatus] = useState(injected ? "ready" : "loading");

  // Which slug we actually hold data for, so a navigation to a different /lp/
  // page refetches while a retry on the same page does not loop. Only set once
  // a request succeeds: marking it up front would let an aborted attempt (the
  // StrictMode remount, or a fast slug switch) block the retry for good.
  const loadedSlug = useRef(injected ? slug : null);

  const load = useCallback(
    (signal) => {
      setStatus("loading");

      const request = previewToken
        ? getDppPreview(slug, previewToken, { signal })
        : getDppBootstrap(slug, { signal });

      request
        .then((payload) => {
          loadedSlug.current = slug;
          setData(payload);
          setStatus("ready");
        })
        .catch((error) => {
          if (
            error?.name === "CanceledError" ||
            error?.code === "ERR_CANCELED"
          ) {
            return;
          }
          setStatus(error?.notFound ? "notFound" : "error");
        });
    },
    [slug, previewToken],
  );

  useEffect(() => {
    // Edge-injected state already covers this slug: nothing to fetch.
    if (loadedSlug.current === slug) return undefined;

    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [slug, load]);

  if (status === "loading") return <LoadingState />;

  if (status === "notFound") {
    return (
      <MessageState
        title="המוצר אינו זמין"
        text="ייתכן שהתכשיט הזה נמכר או הוסר מהאתר. אפשר לראות את שאר הקולקציה בחנות."
        actionLabel="למעבר לחנות"
        onAction={() => navigate("/shop")}
      />
    );
  }

  if (status === "error" || !data) {
    return (
      <MessageState
        title="משהו נתקע לרגע"
        text="לא הצלחנו לטעון את פרטי המוצר. נסו לרענן — הפרטים אמורים לחזור מיד."
        actionLabel="נסו שוב"
        onAction={() => load()}
      />
    );
  }

  return <DppContent data={data} />;
}

/**
 * Split out so useDppState only ever runs with a product in hand — hooks can't
 * live behind the loading guards above.
 */
function DppContent({ data }) {
  const { page, product } = data;
  const ctx = useDppState({ product, page });
  const popupRegistry = usePopupRegistry();

  // The bootstrap already carried this page's popup rules, so handing them to
  // the runtime avoids a second request on the one page where latency is paid
  // for in ad spend.
  useEffect(() => {
    popupRegistry?.registerPopups(data.popups || []);
  }, [popupRegistry, data.popups]);

  // Ad traffic lands here, so this is the ViewContent the ad platforms
  // optimise against (the storefront fires its own from the product modal)
  useEffect(() => {
    trackEvent("ViewContent", productEventPayload(product));
  }, [product]);

  // Tab title, share preview and Product rich-result data for this page.
  // Campaign pages are noindex unless the admin explicitly turns that off.
  useEffect(() => {
    const path = `/lp/${page.slug || product.id}`;
    applyPageMeta({
      title: page.seo?.title || product.name,
      description: (page.seo?.description || product.description || "").slice(0, 160),
      path,
      image: page.seo?.ogImage || product.images?.[0],
      type: "product",
      noindex: page.seo?.noindex !== false,
      language: "he",
    });
    setJsonLd("product", productJsonLd(product, { url: `${SITE_URL}${path}` }));
    return () => setJsonLd("product", null);
  }, [page, product]);

  const blocks = page.blocks || [];
  const flowBlocks = blocks.filter((block) => block.placement !== "pinned");
  const pinnedBlocks = blocks.filter((block) => block.placement === "pinned");

  return (
    <PageFrame background={page.theme?.background}>
      <main>
        {flowBlocks.map((block) => (
          <BlockRenderer key={block.key} block={block} ctx={ctx} />
        ))}
      </main>

      <PageFooter />

      {pinnedBlocks.map((block) => (
        <BlockRenderer key={block.key} block={block} ctx={ctx} />
      ))}
    </PageFrame>
  );
}

export default DppPage;
