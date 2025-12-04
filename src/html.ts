export const html = (siteKey: string, price: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Me</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
    <h1 class="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Contact Me</h1>
    <p class="text-gray-400 text-center mb-8">I will prioritize replying to you for a small fee.</p>

    <div id="form-step">
      <form id="contact-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input type="text" id="name" required maxlength="50" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Contact Details (email/phone/npub)</label>
          <input type="text" id="contact" required maxlength="100" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Message</label>
          <textarea id="message" required maxlength="450" rows="4" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition"></textarea>
          <div class="flex justify-between items-center mt-1">
            <p id="char-counter" class="text-xs text-gray-500"></p>
            <p id="char-warning" class="text-xs text-red-400 hidden">Message too long!</p>
          </div>
        </div>
        <div class="cf-turnstile" data-sitekey="${siteKey}" data-size="flexible"></div>
        <button type="submit" id="submit-btn" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
          Pay & Send
        </button>
      </form>
    </div>

    <div id="invoice-step" class="hidden text-center space-y-6">
      <div class="bg-white p-4 rounded-lg inline-block mx-auto relative">
        <div id="qrcode"></div>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="bg-white p-1 rounded-full shadow-lg flex flex-col items-center justify-center w-16 h-16 border-2 border-purple-500">
            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path></svg>
            <span class="text-xs font-bold text-gray-900 leading-none mt-0.5">${price}</span>
            <span style="font-size: 8px;" class="text-gray-500 leading-none">sats</span>
          </div>
        </div>
      </div>
      <p class="text-sm text-gray-400 break-all px-4" id="invoice-text"></p>
      <div class="flex items-center justify-center space-x-2 text-yellow-400">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Waiting for payment...</span>
      </div>
      <div id="timer-container" class="text-center space-y-2">
        <p class="text-yellow-400 font-bold" id="timer">60:00</p>
        <p class="text-xs text-gray-500">Please don't refresh the page or you'll lose your invoice.</p>
      </div>
      
      <button id="copy-btn" class="text-sm text-purple-400 hover:text-purple-300 underline">Copy Invoice</button>
    </div>

    <div id="expired-step" class="hidden text-center space-y-4">
      <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </div>
      <h2 class="text-2xl font-bold text-white">Invoice Expired</h2>
      <p class="text-gray-400">This invoice has expired. Please refresh the page to try again.</p>
    </div>

    <div id="success-step" class="hidden text-center space-y-4">
      <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 class="text-2xl font-bold text-white">Message Sent!</h2>
      <p class="text-gray-400">I'll get back to you soon.</p>
    </div>
  </div>

  <script>
    const form = document.getElementById('contact-form');
    const formStep = document.getElementById('form-step');
    const invoiceStep = document.getElementById('invoice-step');
    const successStep = document.getElementById('success-step');
    const qrcodeDiv = document.getElementById('qrcode');
    const invoiceText = document.getElementById('invoice-text');
    const timerDisplay = document.getElementById('timer');
    const expiredStep = document.getElementById('expired-step');
    
    const nameInput = document.getElementById('name');
    const contactInput = document.getElementById('contact');
    const messageInput = document.getElementById('message');
    const charCounter = document.getElementById('char-counter');
    const charWarning = document.getElementById('char-warning');
    const submitBtn = document.getElementById('submit-btn');
    
    const MAX_DESCRIPTION_BYTES = 639;
    
    let checkInterval;
    let countdownInterval;

    // Calculate total description length
    function calculateDescriptionLength() {
      const name = nameInput.value;
      const contact = contactInput.value;
      const message = messageInput.value;
      const description = 'Message from ' + name + ' (' + contact + '): ' + message;
      return new TextEncoder().encode(description).length;
    }

    // Update character counter
    function updateCharCounter() {
      try {
        if (!charCounter || !charWarning || !submitBtn) {
          return;
        }
        
        const bytes = calculateDescriptionLength();
        const remaining = MAX_DESCRIPTION_BYTES - bytes;
        
        charCounter.textContent = bytes + '/639 bytes';
        charCounter.style.fontSize = '0.75rem';

        if (remaining < 0) {
          charCounter.style.color = '#f87171';
          charWarning.style.display = 'block';
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.5';
          submitBtn.style.cursor = 'not-allowed';
        } else if (remaining < 50) {
          charCounter.style.color = '#facc15';
          charWarning.style.display = 'none';
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.cursor = 'pointer';
        } else {
          charCounter.style.color = '#6b7280';
          charWarning.style.display = 'none';
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.cursor = 'pointer';
        }
      } catch (error) {
        console.error('Error in updateCharCounter:', error);
      }
    }

    // Add event listeners for real-time validation
    nameInput.addEventListener('input', updateCharCounter);
    contactInput.addEventListener('input', updateCharCounter);
    messageInput.addEventListener('input', updateCharCounter);

    // Initialize counter
    updateCharCounter();

    // Add event listeners for real-time validation
    nameInput.addEventListener('input', updateCharCounter);
    contactInput.addEventListener('input', updateCharCounter);
    messageInput.addEventListener('input', updateCharCounter);

    // Initialize counter
    updateCharCounter();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value;
      const contact = contactInput.value;
      const message = messageInput.value;

      // Get Turnstile token
      const turnstileResponse = turnstile.getResponse();
      if (!turnstileResponse) {
        alert('Please complete the CAPTCHA');
        return;
      }

      const btn = form.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Generating Invoice...';

      try {
        const res = await fetch('/api/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            contact,
            message,
            'cf-turnstile-response': turnstileResponse
          })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        showInvoice(data.payment_request, data.payment_hash);
      } catch (err) {
        alert('Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Pay & Send';
        turnstile.reset();
      }
    });

    function showInvoice(invoice, hash) {
      formStep.style.display = 'none';
      invoiceStep.style.display = 'block';

      try {
        new QRCode(qrcodeDiv, {
          text: invoice,
          width: 256,
          height: 256,
          correctLevel: QRCode.CorrectLevel.L
        });
      } catch (error) {
        console.error('QR code generation failed:', error);
        qrcodeDiv.innerHTML = '<p class="text-red-400 text-sm p-4">QR code too large. Please copy the invoice below.</p>';
      }

      invoiceText.textContent = invoice.substring(0, 20) + '...' + invoice.substring(invoice.length - 20);

      document.getElementById('copy-btn').onclick = () => {
        navigator.clipboard.writeText(invoice);
        alert('Copied!');
      };

      pollPayment(hash);
      startTimer();
    }

function startTimer() {
  let timeLeft = 60 * 60; // 1 hour in seconds

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
  }

  updateDisplay();

  countdownInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      clearInterval(checkInterval);
      showExpired();
    }
  }, 1000);
}

    function showExpired() {
      invoiceStep.style.display = 'none';
      expiredStep.style.display = 'block';
    }

function pollPayment(hash) {
  checkInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/check/' + hash);
      const data = await res.json();
      if (data.paid) {
        clearInterval(checkInterval);
        clearInterval(countdownInterval);
        showSuccess();
      }
    } catch (e) {
      console.error(e);
    }
  }, 3000);
}

function showSuccess() {
  invoiceStep.style.display = 'none';
  successStep.style.display = 'block';
}
</script>
  </body>
  </html>
    `
