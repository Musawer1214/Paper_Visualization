# AlphaQubit: AI for Quantum Error Correction

An interactive visualization of the "AlphaQubit" research paper, demonstrating how recurrent neural networks are revolutionizing quantum error decoding. This application bridges complex quantum computing concepts with intuitive UI and 3D visualizations.

## Overview

Building a large-scale quantum computer requires correcting errors that inevitably arise in physical systems. The state-of-the-art approach is the **Surface Code**. This web application visualizes **AlphaQubit**, a decoding system developed by Google DeepMind and Google Quantum AI that uses machine learning to identify and correct these errors with unprecedented accuracy.

## Features

*   **Interactive Surface Code Diagram**: A hands-on simulation where you can inject errors into data qubits and watch how "stabilizer" qubits detect parity violations (syndromes).
*   **Neural Network Visualization**: Animated diagrams illustrating the Recurrent Transformer architecture that AlphaQubit uses to process syndrome history.
*   **Performance Metrics**: Interactive charts comparing AlphaQubit's logical error rates against the standard Minimum-Weight Perfect Matching (MWPM) algorithm.
*   **Immersive 3D Graphics**: Beautiful, real-time 3D renderings of quantum particles and cryostat environments using React Three Fiber.
*   **Responsive Design**: A clean, "scientific journal" aesthetic that works seamlessly across desktop and mobile devices.

## Tech Stack

*   **React 19**: Core component library.
*   **Three.js & React Three Fiber**: High-performance 3D graphics.
*   **Framer Motion**: Complex animations and transitions.
*   **Tailwind CSS**: Utility-first styling.
*   **Lucide React**: Iconography.

## How to Use Locally

This project is currently configured to use **ES Modules** via an `importmap` in `index.html`, allowing it to run in the browser without a heavy build step, provided you have an internet connection to fetch the packages from the CDN.

### Quick Start (Static Server)

1.  **Download/Clone**: Ensure all files (`index.html`, `index.tsx`, `App.tsx`, `components/*`, etc.) are in the same directory structure.
2.  **Serve**: Run a local static file server in the project root.
    *   **Python**: `python3 -m http.server 8000`
    *   **Node.js**: `npx serve .`
3.  **View**: Open `http://localhost:8000` in your browser.

### Full Development Setup (Vite)

If you wish to continue developing this project with a standard build pipeline (for offline support and better type checking), follow these steps:

1.  **Initialize Project**:
    ```bash
    npm create vite@latest alphaqubit-app -- --template react-ts
    cd alphaqubit-app
    ```

2.  **Install Dependencies**:
    ```bash
    npm install three @types/three @react-three/fiber @react-three/drei framer-motion lucide-react
    ```

3.  **Configure Tailwind**:
    Follow the [Tailwind CSS Vite Guide](https://tailwindcss.com/docs/guides/vite) to generate your `tailwind.config.js` and `postcss.config.js`.

4.  **Migrate Files**:
    *   Move `App.tsx`, `index.tsx` (rename to `main.tsx` for Vite), and the `components` folder into `src/`.
    *   Ensure imports in `main.tsx` match the Vite structure.

5.  **Run**:
    ```bash
    npm run dev
    ```

## File Structure

*   `index.html`: The entry point. Contains the import map for React and Three.js dependencies.
*   `App.tsx`: The main application layout, handling navigation and the narrative flow.
*   `components/Diagrams.tsx`: Contains the interactive 2D visualizations (Surface Code, Transformer, Charts).
*   `components/QuantumScene.tsx`: Contains the 3D Three.js scenes (Hero background, Quantum Computer model).
*   `metadata.json`: Configuration for the environment.
