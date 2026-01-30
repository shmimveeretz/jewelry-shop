import { useEffect, useState } from 'react';

function ShabbatMode() {
    const [isShabbat, setIsShabbat] = useState(false);

    useEffect(() => {
        const checkShabbatTime = () => {
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
            const hours = now.getHours();

            // Friday after 18:00 (6 PM) or Saturday before 20:00 (8 PM)
            const isFridayEvening = dayOfWeek === 5 && hours >= 18;
            const isSaturday = dayOfWeek === 6 && hours < 20;

            const shabbatActive = isFridayEvening || isSaturday;
            setIsShabbat(shabbatActive);

            // Apply/remove shabbat mode to body
            if (shabbatActive) {
                document.body.classList.add('shabbat-mode');
            } else {
                document.body.classList.remove('shabbat-mode');
            }
        };

        // Check immediately
        checkShabbatTime();

        // Check every minute
        const interval = setInterval(checkShabbatTime, 60000);

        return () => {
            clearInterval(interval);
            document.body.classList.remove('shabbat-mode');
        };
    }, []);

    if (!isShabbat) {
        return null;
    }

    return (
        <div className="shabbat-overlay">
            <div>
                <h2>🕯️ שבת שלום 🕯️</h2>
                <p>
                    האתר נמצא במצב שומר שבת.
                    <br />
                    האתר יפעל מחדש במוצאי שבת.
                </p>
                <p style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
                    💫 שבת שלום ומבורכת 💫
                </p>
            </div>
        </div>
    );
}

export default ShabbatMode;
