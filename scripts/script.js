document.getElementById('download-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const url = document.querySelector('input[name="url"]').value;
    const format = document.querySelector('select[name="format"]').value;
    const errorMessageDiv = document.getElementById('error-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    errorMessageDiv.style.display = 'none'; // Hide previous error message

    const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;

    if (!youtubeRegex.test(url)) {
        errorMessageDiv.textContent = 'Please enter a valid YouTube URL';
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.classList.add('slideDown');
        setTimeout(() => {
            errorMessageDiv.style.display = 'none';
            errorMessageDiv.classList.remove('slideDown');
        }, 5000);
        return;
    }

    try {
        loadingIndicator.style.display = 'block'; // Show loading indicator

        const response = await fetch(`/download?url=${encodeURIComponent(url)}&format=${format}`);
        if (!response.ok) {
            const errorData = await response.json();
            errorMessageDiv.textContent = errorData.error;
            errorMessageDiv.style.display = 'block';
            errorMessageDiv.classList.add('slideDown');
            setTimeout(() => {
                errorMessageDiv.style.display = 'none';
                errorMessageDiv.classList.remove('slideDown');
            }, 5000);
        } else {
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = response.headers.get('Content-Disposition').split('filename=')[1].replace(/"/g, '');
            link.click();
        }
    } catch (error) {
        errorMessageDiv.textContent = 'An unexpected error occurred';
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.classList.add('slideDown');
        setTimeout(() => {
            errorMessageDiv.style.display = 'none';
            errorMessageDiv.classList.remove('slideDown');
        }, 5000);
    } finally {
        loadingIndicator.style.display = 'none'; // Hide loading indicator regardless of success or failure
    }
});
