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
      showSubmission(submission.name, submission.answer);
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
  function showSubmission(name, answer) {
    const bubble = Array.from(submissionsContainer.getElementsByClassName('submission'))
                        .find(bubble => bubble.textContent === '');
    
    if (bubble) {
      // Show the name initially
      bubble.textContent = name; 
      playBubbleSound();  // Play sound when bubble updates
      
      // Add the click event listener to toggle between name and answer
      bubble.addEventListener('click', function() {
        if (bubble.textContent === name) {
          bubble.textContent = answer;  // Show answer when name is displayed
        } else if (bubble.textContent === answer) {
          bubble.textContent = '';  // Clear the bubble when answer is displayed
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