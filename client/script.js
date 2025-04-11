document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById('startButton');
  const timer = document.getElementById('timer');
  const timeRemaining = document.getElementById('timeRemaining');
  const submissionsContainer = document.getElementById('submissions');
  
  const backgroundMusic = document.getElementById('backgroundMusic');
  const alarmSound = document.getElementById('alarmSound');
  
  let timerInterval;
  let isTimerActive = false;
  
  // Connect to the WebSocket server
  const socket = new WebSocket('ws://localhost:3000');
  
  // When WebSocket is opened, log a message
  socket.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  // Handle incoming data from WebSocket
  socket.onmessage = (event) => {
    if (isTimerActive) {
      const submission = JSON.parse(event.data);
      showSubmission(submission.name, submission.answer, submission.wager);
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
        alarmSound.play();
        timer.classList.add('hidden');
        
        // Re-enable and show the start button after the timer finishes
        startButton.style.display = 'inline-block'; // Make it visible again
        startButton.disabled = false; // Re-enable the button for next click
      }
    }, 1000);

  });

  // Function to update the text of a bubble
  function showSubmission(name, answer, wager) {
    const bubble = Array.from(submissionsContainer.getElementsByClassName('submission'))
                        .find(bubble => bubble.textContent === '');
    const toggleStatus = document.getElementById('toggleStatus');
  
    if (bubble) {
      bubble.textContent = name;
      playBubbleSound();
  
      // Keep track of state using a data attribute
      bubble.dataset.state = "name";
  
      bubble.addEventListener('click', function () {
        const isFinalJeopardy = toggleStatus.textContent === "On";
  
        if (isFinalJeopardy) {
          // Final Jeopardy: name -> answer -> wager -> clear
          if (bubble.dataset.state === "name") {
            bubble.textContent = answer;
            bubble.dataset.state = "answer";
          } else if (bubble.dataset.state === "answer") {
            bubble.textContent = wager;
            bubble.dataset.state = "wager";
          } else {
            bubble.textContent = "";
            bubble.dataset.state = "name";
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
      });
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