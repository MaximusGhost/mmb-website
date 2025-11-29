(function () {
  'use strict';

  function initCsMatrixHero() {
    var body = document.body;
    if (!body || body.id !== 'cs') {
      return;
    }

    var canvas = document.getElementById('cs-matrix-canvas');
    if (!canvas || !canvas.getContext) {
      return;
    }

    var ctx = canvas.getContext('2d');

    var messages = [
      'Admission is not the door. Curiosity is.',
      'Seek the pattern behind the noise. It’s always there.',
      'Stanford OHS is not a school. It’s a portal.',
      'The robot roams the neighborhood. The future roams with it.',
      'Every piano key is a choice. Every choice alters the system.',
      'CS and Math are two halves of the same equation.'
    ];

    var config = {
      fontFamily: "'Inconsolata', monospace",
      baseFontSizeDesktop: 16,
      baseFontSizeMobile: 12,
      dropSpeed: 1.2,          // controls fall speed (rows per frame-equivalent)
      trailRows: 25,           // approximate visible trail length in characters
      trailEpsilon: 0.1,       // brightness floor for end of trail
      textColor: '#0f0',
      messageColor: '#aaffaa',
      messageIntervalMin: 8000,
      messageIntervalMax: 16000,
      messageDuration: 10000
    };

    var width = 0;
    var height = 0;
    var fontSize = 16;          // base font size; each column will have its own variation
    var columns = 0;
    var drops = [];
    var speeds = [];            // per-column speed, slightly randomized around base dropSpeed
    var fontSizes = [];         // per-column font size
    var lastHeadYs = [];        // per-column previous head Y position (for demoting white to green)
    var animationFrameId = null;
    var trailAlpha = 0.08;

    // Time-based update control: how often to advance drops (ms) and last update time
    var stepIntervalMs = 120;               // increase for slower motion, decrease for faster
    var lastUpdateTime = performance.now(); // tracks last time we moved the drops

    var messageState = {
      nextMessageTime: performance.now() + randomBetween(config.messageIntervalMin, config.messageIntervalMax),
      activeMessages: []
    };

    function randomBetween(min, max) {
      return Math.random() * (max - min) + min;
    }

    function pickRandomMessage() {
      return messages[Math.floor(Math.random() * messages.length)];
    }

    function resizeCanvas() {
      var pixelRatio = window.devicePixelRatio || 1;
      var displayWidth = canvas.clientWidth || window.innerWidth;
      var displayHeight = canvas.clientHeight || window.innerHeight;

      width = displayWidth;
      height = displayHeight;

      canvas.width = displayWidth * pixelRatio;
      canvas.height = displayHeight * pixelRatio;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      fontSize = (window.innerWidth <= 768 ? config.baseFontSizeMobile : config.baseFontSizeDesktop);

      // Slight extra spacing between columns so the rain is less horizontally condensed
      columns = Math.floor(width / (fontSize * 1.1)) || 1;
      drops = [];
      speeds = [];
      fontSizes = [];
      lastHeadYs = [];

      for (var i = 0; i < columns; i++) {
        // Randomize font size per string around the base font size
        var colFontSize = fontSize * randomBetween(0.65, 1);
        fontSizes[i] = colFontSize;

        // Start each drop somewhere above the top, in units of its own font size
        drops[i] = Math.random() * -(height / colFontSize);

        // Assign each column its own constant speed, slightly varied around dropSpeed
        speeds[i] = config.dropSpeed * randomBetween(0.6, 1.2);

        // No previous head yet
        lastHeadYs[i] = null;
      }

      // Set a default font; per-column overrides happen in the draw loop
      ctx.font = fontSize + 'px ' + config.fontFamily;
    }

    function createMessage(now) {
      var text = pickRandomMessage();

      // Center the full sentence horizontally in the middle of the screen
      var metrics = ctx.measureText(text);
      var textWidth = metrics && metrics.width ? metrics.width : text.length * fontSize * 0.6;
      var x = (width - textWidth) / 2;
      var y = height / 2;

      messageState.activeMessages.push({
        text: text,
        x: x,
        y: y,
        startTime: now
      });

      messageState.nextMessageTime = now + randomBetween(config.messageIntervalMin, config.messageIntervalMax);
    }

    function drawMessages(now) {
      var duration = config.messageDuration;
      var remainingMessages = [];

      for (var i = 0; i < messageState.activeMessages.length; i++) {
        var msg = messageState.activeMessages[i];
        var elapsed = now - msg.startTime;

        if (elapsed < duration) {
          // Horizontal sentences: draw in bright white, larger and bold for emphasis
          ctx.fillStyle = '#ffffff';
          var messageFontSize = fontSize * 1.2; 
          ctx.font = messageFontSize + 'px ' + config.fontFamily;

          // Draw the whole sentence horizontally at the precomputed center position
          ctx.fillText(msg.text, msg.x, msg.y);
          remainingMessages.push(msg);
        }
      }

      messageState.activeMessages = remainingMessages;
    }

    // Recompute trail alpha so that visible trail length is controlled
    // primarily by config.trailRows and not tightly coupled to dropSpeed.
    function recomputeTrailAlpha() {
      var v = config.dropSpeed;
      var N = config.trailRows;
      var eps = config.trailEpsilon;

      if (v <= 0 || N <= 0) {
        trailAlpha = 0.08;
        return;
      }

      // Approximate number of frames to traverse N rows at speed v (rows/frame)
      var k = N / v;
      // After k frames, brightness ~ eps; solve (1 - alpha)^k = eps
      var base = Math.pow(eps, 1 / k);
      trailAlpha = 1 - base;
    }

    recomputeTrailAlpha();

    function drawFrame() {
      var now = performance.now();

      if (width === 0 || height === 0) {
        resizeCanvas();
      }

      // Time-based delay: only render and move drops when enough time has passed
      if ((now - lastUpdateTime) < stepIntervalMs) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
        return;
      }
      lastUpdateTime = now;

      ctx.fillStyle = 'rgba(0, 0, 0,' + trailAlpha + ')';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = config.textColor;

      for (var i = 0; i < drops.length; i++) {
         // Per-column font size
         var colFontSize = fontSizes[i] || fontSize;
         ctx.font = 'bold ' + colFontSize + 'px ' + config.fontFamily;

        var x = i * fontSize * 1.1;   // horizontal spacing still based on base font size
        var y = drops[i] * colFontSize;

        // SECOND: neon green at previous head position (demote old head to green)
        var prevY = lastHeadYs[i];
        if (prevY != null && prevY >= 0 && prevY <= height) {
          // Hard clear the cell where the old white head was, so it truly disappears,
          // then draw the new green "second" character on a clean background.
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, prevY - colFontSize, colFontSize * 1.1, colFontSize * 1.2);

          ctx.fillStyle = config.textColor; // neon green
          var secondChar = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
          ctx.fillText(secondChar, x, prevY);
        }

        // HEAD: current first character – bright white
        var headChar = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
        ctx.fillStyle = '#ffffff';
        ctx.fillText(headChar, x, y);

        // Store current head position so that next frame it becomes the green "second" character
        lastHeadYs[i] = y;

        // Older characters below are from previous frames and fade via trailAlpha,
        // giving a diminishing-intensity green trail.

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
          // When a stream restarts from the top, give it a new, slightly different speed
          speeds[i] = config.dropSpeed * randomBetween(0.8, 1.2);
          // And a fresh font size variation
          fontSizes[i] = fontSize * randomBetween(0.85, 1.15);
          // Reset previous head so new stream starts clean
          lastHeadYs[i] = null;
        } else {
          // Use per-column speed; visual trail length is controlled separately via trailRows
          drops[i] += speeds[i]; // individual constant speed per string
        }
      }

      if (now >= messageState.nextMessageTime && messageState.activeMessages.length < 3) {
        createMessage(now);
      }

      drawMessages(now);

      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    function start() {
      if (animationFrameId != null) {
        return;
      }
      resizeCanvas();
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    function stop() {
      if (animationFrameId != null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function handleVisibility() {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    }

    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibility);

    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCsMatrixHero);
  } else {
    initCsMatrixHero();
  }
})();