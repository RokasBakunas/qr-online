const express = require('express');
const QRCode = require('qrcode');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>QR code generator</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .qr-container { margin-top: 20px; }
                </style>
            </head>
            <body>
                <h2>QR code generator</h2>
                <form>
                    Text: <input type="text" name="text" required><br><br>
                    Text color: <input type="color" name="color" value="#000000"><br><br>
                    background color: <input type="color" name="bgColor" value="#FFFFFF"><br><br>
                    size width (px): <input type="number" name="width" value="500"><br><br>
                    <input type="submit" value="Generate qr code">
                </form>
                <div class="qr-container"></div>
                <div class="qr-actions">
                    <button onclick="downloadQR()">Save as...</button>
                    <button onclick="printQR()">Print</button>
                </div>
                <script>
                    const form = document.querySelector('form');
                    const qrContainer = document.querySelector('.qr-container');

                    form.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        
                        const formData = new URLSearchParams(new FormData(form)).toString();
                        
                        const response = await fetch('/generate-qr?' + formData);
                        const qrImage = await response.text();
                        
                        qrContainer.innerHTML = qrImage;
                    });

                    function downloadQR() {
                        const formData = new URLSearchParams(new FormData(form)).toString();
                        window.location = '/download-qr?' + formData;
                    }

                    function printQR() {
                        const printWindow = window.open('', '_blank');
                        printWindow.document.write('<html><head><title>Print qr code</title></head><body>');
                        printWindow.document.write(qrContainer.innerHTML);
                        printWindow.document.write('</body></html>');
                        printWindow.document.close();
                        printWindow.print();
                    }
                </script>
            </body>
        </html>
    `);
});

app.get('/generate-qr', async (req, res) => {
    try {
        const text = req.query.text || 'Hello baby';
        const color = req.query.color || '#000000';
        const backgroundColor = req.query.bgColor || '#FFFFFF';
        const width = parseInt(req.query.width) || 500;

        const qrOptions = {
            color: {
                dark: color,
                light: backgroundColor
            },
            width: width
        };

        const qrImage = await QRCode.toDataURL(text, qrOptions);

        res.send(`<img src="${qrImage}" alt="QR Code" />`);
    } catch (error) {
        res.status(500).send('Error.');
    }
});

app.get('/download-qr', async (req, res) => {
    try {
        const text = req.query.text || 'Hello baby';
        const color = req.query.color || '#000000';
        const backgroundColor = req.query.bgColor || '#FFFFFF';
        const width = parseInt(req.query.width) || 500;

        const qrOptions = {
            color: {
                dark: color,
                light: backgroundColor
            },
            width: width
        };

        const qrImage = await QRCode.toDataURL(text, qrOptions);
        const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");

        const sanitizedFileName = text.replace(/[^a-z0-9]/gi, '_').substring(0, 200) + "_qrcode.png";

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename=${sanitizedFileName}`
        });
        res.end(Buffer.from(base64Data, 'base64'));


    } catch (error) {
        res.status(500).send('Klaida generuojant QR kodą.');
    }
});

app.listen(port, () => {
    console.log(`Server Adress http://localhost:${port}`);
});
