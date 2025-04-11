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
        alarmSound.play();
        timer.classList.add('hidden');
        submissionsContainer.classList.add('hidden');
      }
    }, 1000);

    // Show the submissions container
    submissionsContainer.classList.remove('hidden');
    fetchSubmissions();  // Fetch submissions from the server
  });

  // Fetch submissions from the server and display them
  function fetchSubmissions() {
    fetch('http://localhost:3000/view-submissions')
      .then(response => response.json())
      .then(submissions => {
        // Initially populate the bubbles
        submissions.submissions.forEach((submission, index) => {
          createBubble(index + 1);  // Pre-create the bubbles without text
        });
      })
      .catch(error => {
        console.error('Error fetching submissions:', error);
      });
  }

  // Function to update the text of a bubble
  function showSubmission(name, answer) {
    const bubble = Array.from(submissionsContainer.getElementsByClassName('submission'))
                        .find(bubble => bubble.textContent === '');
    
    if (bubble) {
      bubble.textContent = `${name}: ${answer}`;
      playBubbleSound();  // Play sound when bubble updates
    }
  }

  // Function to play the bubble sound
  function playBubbleSound() {
    const bubbleSound = new Audio('bubble_sound.mp3');
    bubbleSound.play();
  }
});

