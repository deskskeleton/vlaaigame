# Cake Bargaining Game

A simple web-based implementation of the cake bargaining game with GPT-4 chat integration.

## Overview

This game implements a classic bargaining scenario where two players need to agree on how to split a cake worth $100. One player (the human) makes offers, while the AI responds to these offers. The game includes a chat interface with GPT-4 to help explain the rules and provide guidance.

## Setup

1. Clone this repository to your local machine
2. Get an OpenAI API key from [OpenAI's platform](https://platform.openai.com)
3. Open `chat.js` and replace `'YOUR_API_KEY'` with your actual OpenAI API key
4. Open `index.html` in a web browser

## Game Rules

1. The game starts with a cake worth $100
2. Players take turns making offers on how to split the cake
3. Each round:
   - The human player makes an offer (e.g., $60 for themselves, leaving $40 for the AI)
   - The AI either accepts or rejects the offer
   - If rejected, the game continues to the next round
4. The game ends when:
   - An offer is accepted
   - The maximum number of rounds (3) is reached
   - If no agreement is reached, neither player gets anything

## Features

- Clean, modern UI
- Real-time game history
- Interactive chat with GPT-4
- Mobile-responsive design

## Technical Details

- Pure HTML/CSS/JavaScript implementation
- No external dependencies required
- GPT-4 integration for intelligent responses
- Modular code structure for easy maintenance

## Cost Estimation

The GPT-4 integration will cost approximately:
- $0.03 per 1K input tokens
- $0.06 per 1K output tokens
- Average conversation might cost $0.01-0.05 per game

## Security Note

Never commit your API key to version control. In a production environment, you should:
1. Use environment variables
2. Implement proper API key management
3. Add rate limiting
4. Implement user authentication

## License

MIT License - Feel free to use and modify as needed. 