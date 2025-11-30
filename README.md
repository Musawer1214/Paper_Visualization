
# ScholarLens AI: Research Visualizer

An interactive web application that transforms dense research papers into engaging, interactive web experiences. Originally designed for the "AlphaQubit" paper, it now uses **Google Gemini 2.5 Flash** to analyze and visualize any research abstract you provide.

## Features

*   **AI-Powered Analysis**: Paste any research abstract, and the app uses the Gemini API to extract the title, authors, summary, and key concepts.
*   **Dynamic Theming**: The application automatically categorizes papers into themes (Quantum, AI, Biology, Cosmos, etc.) and adjusts the color palette and 3D background animations accordingly.
*   **Interactive Visualizations**:
    *   **3D Particle Scenes**: Real-time React Three Fiber backgrounds that shift geometry based on the research topic.
    *   **Concept Networks**: An interactive graph of key concepts extracted from the text.
*   **Original Demo**: Includes the highly specific, hardcoded interactive diagrams for the AlphaQubit paper (Surface Code simulation, Transformer architecture) as a demonstration of high-fidelity manual visualization.

## Tech Stack

*   **React 19**: Core component library.
*   **Google Gemini API**: For text analysis and content generation.
*   **React Three Fiber (Three.js)**: High-performance 3D graphics.
*   **Framer Motion**: Complex animations and transitions.
*   **Tailwind CSS**: Styling.

## How to Use

1.  **Enter API Key**: Ensure your environment has a valid `API_KEY` for the Google GenAI SDK.
2.  **Paste Text**: Click "New Paper" in the navigation bar. Paste the abstract or introduction of a paper.
3.  **Generate**: Click "Generate Visualization". The app will rebuild itself around your content.
4.  **Explore**: Scroll through the narrative, interact with the concept cards, and enjoy the 3D atmosphere.

## Development

To run locally:
1.  Clone the repo.
2.  `npm install`
3.  `npm run dev`
