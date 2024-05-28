const express = require('express');
const ytdl = require('ytdl-core');
const sanitize = require("sanitize-filename");
const emojiStrip = require('emoji-strip');
const app = express();
const PORT = 3000;

app.use('/public', express.static(__dirname + '/../public'));
app.use('/styles', express.static(__dirname + '/../styles'));
app.use('/scripts', express.static(__dirname + '/../scripts'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/download', async (req, res) => {
    const url = req.query.url;
    const formatType = req.query.format; // Obter o formato (áudio ou vídeo)

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { filter: formatType === 'audio' ? 'audioonly' : 'videoandaudio', quality: 'highestaudio' });

        // Remover emojis do título do vídeo
        const cleanTitle = emojiStrip(info.videoDetails.title);

        // Limpar o título do vídeo para remover outros caracteres inválidos
        const sanitizedTitle = sanitize(cleanTitle);

        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.${formatType === 'audio' ? 'mp3' : 'mp4'}"`);

        ytdl(url, { format: format })
            .pipe(res)
            .on('end', () => {
                console.log('Download completed');
            })
            .on('error', (err) => {
                console.error(err);
                res.status(500).send('Error during download');
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing request' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
