document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById('startButton');
  const timer = document.getElementById('timer');
  const timeRemaining = document.getElementById('timeRemaining');
  const submissionsContainer = document.getElementById('submissions');
  
  const backgroundMusic = document.getElementById('backgroundMusic');
  const musicTracks = ['timer_music_1.mp3', 'timer_music_2.mp3', 'timer_music_3.mp3'];
  let currentTrackIndex = 0;
  backgroundMusic.src = musicTracks[currentTrackIndex];
  const alarmSound = document.getElementById('alarmSound');
  
  let timerInterval;
  let isTimerActive = false;
  
  // Connect to the WebSocket server
  const socket = new WebSocket('ws://localhost:3000');
  
  // When WebSocket is opened, log a message
  socket.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  const wagers = {}; // global store for name-wager pairs

  // Handle incoming data from WebSocket
  socket.onmessage = (event) => {
    if (isTimerActive) {
      const submission = JSON.parse(event.data);
      showSubmission(submission.name, submission.answer);
    } else { // This means we are accepting wagers
      try {
        const data = JSON.parse(event.data);
  
        // Check if both 'name' and 'wager' fields exist
        if (data.name && data.wager !== undefined) {
          // Store or overwrite the wager for the name
          wagers[data.name] = data.wager;
          console.log(`Wager received: ${data.name} -> ${data.wager}`);
        } else {
          // Data is invalid — missing fields
          console.warn("Invalid wager data received:", data);
        }
      } catch (e) {
        console.error("Failed to parse wager data:", e);
      }
    }
  };
  
  // Handle WebSocket errors
  socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };

  // When the "Start" button is clicked
  startButton.addEventListener('click', () => {
    // Disable the start button when the timer is active
    startButton.disabled = true;
    
    startButton.style.display = 'none';
    timer.classList.remove('hidden');
    let timeLeft = 35;
    timeRemaining.textContent = timeLeft;
    isTimerActive = true;
    backgroundMusic.load();
    backgroundMusic.play();

    // Start countdown
    timerInterval = setInterval(() => {
      timeLeft--;
      timeRemaining.textContent = timeLeft;
      if (timeLeft === 0) {
        clearInterval(timerInterval);
        isTimerActive = false;
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
        backgroundMusic.src = musicTracks[currentTrackIndex];

        alarmSound.play();
        timer.classList.add('hidden');
        
        // Re-enable and show the start button after the timer finishes
        startButton.style.display = 'inline-block'; // Make it visible again
        startButton.disabled = false; // Re-enable the button for next click
      }
    }, 1000);

  });

  // Function to update the text of a bubble
  function showSubmission(name, answer) {
    const bubble = Array.from(submissionsContainer.getElementsByClassName('submission'))
                        .find(bubble => bubble.textContent === '');
    const toggleStatus = document.getElementById('toggleStatus');
  
    if (bubble) {
      bubble.dataset.state = "name";
      bubble.textContent = name;
      playBubbleSound();      
  
      bubble.onclick = function () {
        const isFinalJeopardy = toggleStatus.textContent === "On";
      
        if (isFinalJeopardy) {
          const state = bubble.dataset.state;
          if (state === "name") {
            bubble.textContent = answer;
            bubble.dataset.state = "answer";
            bubble.dataset.name = name;
          } else if (state === "answer") {
            const name = bubble.dataset.name;
            const wager = wagers[name];
            bubble.textContent = wager !== undefined ? `$${wager}` : "[no wager]";
            bubble.dataset.state = "wager";
          } else {
            bubble.textContent = "";
            bubble.dataset.state = "name";
            delete bubble.dataset.name;
          }
      } else {
        // Regular: name -> answer -> clear
        if (bubble.dataset.state === "name") {
          bubble.textContent = answer;
          bubble.dataset.state = "answer";
        } else {
          bubble.textContent = "";
          bubble.dataset.state = "name";
          }
        }        
      }
    }
  }
  
  // Function to play the bubble sound
  function playBubbleSound() {
    const bubbleSound = new Audio('bubble_sound.mp3');
    bubbleSound.play();
  }

  // Toggle final button movement
  const finalToggle = document.getElementById('finalToggle');
  const toggleStatus = document.getElementById('toggleStatus'); // Get the span element

  finalToggle.addEventListener('click', () => {
    // Toggle the "on" class and update the color of the button
    finalToggle.classList.toggle('on');

    // Update the status text based on the toggle's state
    if (finalToggle.classList.contains('on')) {
      toggleStatus.textContent = 'On'; // Set text to "On"
    } else {
      toggleStatus.textContent = 'Off'; // Set text to "Off"
    }
  });
  
});