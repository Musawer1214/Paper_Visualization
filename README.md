# ScholarLens AI

**ScholarLens AI** is a next-generation research visualization platform that transforms dense academic papers into immersive, interactive web experiences. 

Powered by **Google Gemini 2.5 Flash**, it reads PDF manuscripts or abstracts and instantly generates a 3D visual narrative, extracting key concepts, structural diagrams, and thematic aesthetics automatically.

![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg) ![React](https://img.shields.io/badge/React-19-blue) ![Gemini](https://img.shields.io/badge/AI-Gemini_2.5-purple)

## 🌟 Key Features

### 🧠 AI-Powered Analysis
*   **Multimodal Input**: Upload full PDF research papers or paste raw text abstracts.
*   **Semantic Extraction**: Uses Gemini 2.5 Flash to identify the paper's title, authors, core summary, and impact.
*   **Concept Mapping**: Automatically extracts and categorizes key concepts into 'Processes', 'Structures', or 'Abstract' ideas.

### 🎨 Adaptive Visual Engine
*   **Dynamic Theming**: The app analyzes the paper's domain (Quantum, AI, Biology, Cosmos, etc.) and fundamentally changes the 3D environment, color palette, and geometry to match.
*   **3D Hero Scenes**: 
    *   *Quantum*: Golden waves and probability fields.
    *   *AI*: Neural grids and floating data nodes.
    *   *Biology*: Organic, cellular, and soft-body simulations.
    *   *Cosmos*: Planetary orbits and gravitational lensing.

### ⚡ Interactive Experience
*   **Concept Network**: A filterable, interactive grid of extracted ideas.
*   **Hardware Simulation**: (Demo Only) A fully interactive simulation of the "AlphaQubit" Surface Code error correction.
*   **Mouse Parallax**: Subtle 3D camera rigging that responds to user cursor movement for depth perception.

## 🛠️ Architecture

The application is built using a modern React stack optimized for performance and visuals.

| Component | Technology | Purpose |
|O---|---|---|
| **Core** | React 19 | Component lifecycle and state management. |
| **AI** | Google GenAI SDK | Interfacing with Gemini 2.5 Flash for analysis. |
| **3D** | React Three Fiber | Rendering WebGL scenes declaratively. |
| **Styling** | Tailwind CSS | Utility-first responsive design and dark mode. |
| **Motion** | Framer Motion | Complex layout transitions and scroll animations. |

### Directory Structure
```
/src
  ├── components/
  │   ├── DynamicScene.tsx    # The adaptive 3D background engine
  │   ├── GenericVisualizer.tsx # Interactive concept cards for custom papers
  │   ├── Diagrams.tsx        # Hardcoded interactive diagrams for AlphaQubit demo
  │   ├── Navigation.tsx      # Responsive nav & glassmorphism logic
  │   ├── InputModal.tsx      # File upload & loading state management
  ├── App.tsx                 # Main controller and layout
  ├── types.ts                # TypeScript interfaces for PaperData
```

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   A Google Cloud Project with the Gemini API enabled.
*   An API Key stored in your environment.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/scholarlens-ai.git
    cd scholarlens-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment**
    Create a `.env` file in the root:
    ```env
    API_KEY=your_google_gemini_api_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📖 How to Use

1.  **Landing**: The app loads with the "AlphaQubit" demo to showcase the potential of high-fidelity manual visualization.
2.  **New Analysis**: Click the **"New Paper"** button in the top right.
3.  **Upload**: Drag and drop a PDF file or paste an abstract.
4.  **Visualize**: Watch as the AI reads the document (Status: *Reading* -> *Analyzing* -> *Generating*) and rebuilds the website around your research.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the Apache 2.0 License.
