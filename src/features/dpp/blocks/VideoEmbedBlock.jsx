/**
 * The admin supplies a video id, never a URL: the embed origin is built here,
 * so a page cannot be made to iframe an arbitrary site.
 */
const EMBED_URLS = {
  youtube: (id) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
  vimeo: (id) => `https://player.vimeo.com/video/${encodeURIComponent(id)}`,
};

function VideoEmbedBlock({ title, provider = "youtube", videoId, caption }) {
  const buildUrl = EMBED_URLS[provider];
  if (!buildUrl || !videoId) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      {title ? (
        <h2 className="mb-6 text-center font-display text-2xl text-navy">
          {title}
        </h2>
      ) : null}

      <div className="aspect-video overflow-hidden rounded-2xl bg-navy">
        <iframe
          src={buildUrl(videoId)}
          title={title || "וידאו"}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>

      {caption ? (
        <p className="mt-3 text-center text-sm text-gray-500">{caption}</p>
      ) : null}
    </section>
  );
}

export default VideoEmbedBlock;
