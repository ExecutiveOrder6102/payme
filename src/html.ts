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
          <input type="text" id="name" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Contact Details (email/phone/npub)</label>
          <input type="text" id="contact" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Message</label>
          <textarea id="message" required rows="4" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition"></textarea>
        </div>
        <div class="cf-turnstile" data-sitekey="${siteKey}"></div>
        <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02]">
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
            <span class="text-[10px] font-bold text-gray-900 leading-none mt-0.5">${price}</span>
            <span class="text-[8px] text-gray-500 leading-none">sats</span>
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
        <p class="text-red-400 font-bold" id="timer">15:00</p>
        <p class="text-xs text-gray-500">Please pay within 15 minutes. Do not pay if the timer has expired, as your message will not be sent.</p>
      </div>
      
      <div class="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 text-sm text-yellow-200">
        <p class="font-bold flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          IMPORTANT
        </p>
        <p class="mt-1">Do not close or refresh this page until the page displays that your payment is confirmed.</p>
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
    
    let checkInterval;
    let countdownInterval;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const contact = document.getElementById('contact').value;
      const message = document.getElementById('message').value;

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
            'cf-turnstile-response': new FormData(form).get('cf-turnstile-response')
          })
        });
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        showInvoice(data.payment_request, data.payment_hash);
      } catch (err) {
        alert('Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Pay & Send';
      }
    });

    function showInvoice(invoice, hash) {
      formStep.classList.add('hidden');
      invoiceStep.classList.remove('hidden');
      
      new QRCode(qrcodeDiv, {
        text: invoice,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.H
      });
      
      invoiceText.textContent = invoice.substring(0, 20) + '...' + invoice.substring(invoice.length - 20);
      
      document.getElementById('copy-btn').onclick = () => {
        navigator.clipboard.writeText(invoice);
        alert('Copied!');
      };

      pollPayment(hash);
      startTimer();
    }

    function startTimer() {
      let timeLeft = 15 * 60; // 15 minutes in seconds
      
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
      invoiceStep.classList.add('hidden');
      expiredStep.classList.remove('hidden');
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
      invoiceStep.classList.add('hidden');
      successStep.classList.remove('hidden');
    }
  </script>
</body>
</html>
`
