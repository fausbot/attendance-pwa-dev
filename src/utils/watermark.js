export const addWatermarkToImage = async (imageSrc, data) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = "/logo.jpg"; // Path to the uploaded logo

        img.onload = () => {
            // Wait for logo to load as well
            if (!logo.complete) {
                logo.onload = () => drawCanvas();
                logo.onerror = () => drawCanvas(); // Draw even if logo fails
            } else {
                drawCanvas();
            }

            function drawCanvas() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas dimensions to match image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // --- Draw Mode Label (ENTRADA/SALIDA) at Top ---
                const modeText = data.mode === 'entry' ? 'ENTRADA' : 'SALIDA';
                const modeFontSize = Math.max(40, img.width * 0.08); // Large font
                ctx.font = `bold ${modeFontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                // Measure text for background
                const modeTextWidth = ctx.measureText(modeText).width;
                const modePadding = 20;
                const modeBoxWidth = modeTextWidth + (modePadding * 2);
                const modeBoxHeight = modeFontSize + (modePadding * 2);
                const modeBoxX = (canvas.width - modeBoxWidth) / 2;
                const modeBoxY = 20;

                // Background for mode label
                ctx.fillStyle = data.mode === 'entry' ? 'rgba(34, 197, 94, 0.85)' : 'rgba(239, 68, 68, 0.85)'; // Green for entry, Red for exit
                ctx.fillRect(modeBoxX, modeBoxY, modeBoxWidth, modeBoxHeight);

                // Draw mode text
                ctx.fillStyle = '#ffffff';
                ctx.fillText(modeText, canvas.width / 2, modeBoxY + modePadding);

                // Reset text alignment for other text
                ctx.textAlign = 'left';

                // --- Draw Logo ---
                // Draw logo small in top-left
                const logoWidth = img.width * 0.15; // 15% of width
                const logoHeight = logoWidth * (logo.height / logo.width);
                // Fallback if logo failed to load or has 0 dims
                if (logo.width > 0) {
                    ctx.drawImage(logo, 20, 20, logoWidth, logoHeight);
                }

                // --- Watermark Text ---
                const fontSize = Math.max(20, img.width * 0.035); // Slightly larger font
                ctx.font = `bold ${fontSize}px monospace`;
                ctx.textBaseline = 'bottom';

                // Calculate lines for Address (Wrap logic)
                const fullAddress = (data.locationName || '').trim();
                let addressLine1 = fullAddress;
                let addressLine2 = '';

                // Target split point (e.g. 40 chars to fill width better, as requested "more to the right")
                const maxLineLength = 40;

                if (fullAddress.length > maxLineLength) {
                    // Find a space near the limit to break cleanly, searching backwards from the limit
                    // We search from index 40 backwards to find the last space of the first line
                    let breakPoint = fullAddress.lastIndexOf(' ', maxLineLength);

                    // Safety: if the first word is huge (no space found before 40), try finding one *after* 40
                    if (breakPoint === -1) {
                        breakPoint = fullAddress.indexOf(' ', maxLineLength);
                    }

                    // If still no space (entire address is one giant string), force split
                    if (breakPoint === -1) breakPoint = maxLineLength;

                    addressLine1 = fullAddress.substring(0, breakPoint);
                    addressLine2 = fullAddress.substring(breakPoint).trim();
                }

                // Layout
                const padding = 15;
                const lineHeight = fontSize * 1.3;
                // Lines: ID, Date, Coords, Loc1, Loc2
                const lineCount = 5;
                const textBlockHeight = (lineHeight * lineCount) + (padding * 2);

                // Background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(0, canvas.height - textBlockHeight, canvas.width, textBlockHeight);

                // Draw Text
                ctx.fillStyle = '#ffffff';
                let y = canvas.height - textBlockHeight + padding + fontSize;
                const x = padding;

                ctx.fillText(`ID: ${data.employeeId}`, x, y);
                y += lineHeight;
                ctx.fillText(`FECHA: ${data.timestamp}`, x, y);
                y += lineHeight;
                ctx.fillText(`UBICACIÓN: ${data.coords}`, x, y);
                y += lineHeight;

                // Address Line 1
                ctx.fillText(`LOCALIDAD: ${addressLine1}`, x, y);
                y += lineHeight;

                // Address Line 2 (only if exists)
                if (addressLine2) {
                    ctx.fillText(`           ${addressLine2}`, x, y); // Indent slightly
                }

                resolve(canvas.toDataURL('image/jpeg', 0.8));
            }
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

export const fetchServerTime = async () => {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        const data = await response.json();
        return new Date(data.utc_datetime).toLocaleString();
    } catch (error) {
        console.error("Error fetching server time, falling back to local time", error);
        return new Date().toLocaleString();
    }
};

export const fetchLocationName = async (lat, lng) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) {
            // Return a shortened address (first 3 parts usually suffice)
            return data.display_name.split(',').slice(0, 3).join(',');
        }
        return "Dirección no encontrada";
    } catch (error) {
        console.error("Error fetching location name:", error);
        return "Sin conexión a mapas";
    }
};
