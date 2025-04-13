# Professional Resume Builder

A modern web application for creating professional resumes with LaTeX-based PDF generation.

## Features

- 🎨 Professional resume templates
- 📝 Multi-step form for easy data entry
- 🎓 Education and work experience management
- 💡 Skills categorization (Technical & Soft Skills)
- 📊 Real-time preview
- 📄 LaTeX-based PDF generation
- 💾 Save and manage multiple resume templates
- 🌙 Dark/Light theme support

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **PDF Generation**: LaTeX
- **Styling**: Custom CSS with responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- LaTeX distribution (for PDF generation)
  - macOS: [MacTeX](https://www.tug.org/mactex/)
  - Windows: [MiKTeX](https://miktex.org/)
  - Linux: `sudo apt-get install texlive-full`

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aryamanan/resumeBuilder.git
   cd resumeBuilder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `temp` directory for LaTeX files:
   ```bash
   mkdir temp
   ```

## Usage

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Follow the step-by-step form to create your resume:
   - Enter personal information
   - Add education details
   - Add work experience
   - List your skills
   - Choose a template
   - Generate and download your PDF

## Project Structure

```
resumeBuilder/
├── public/              # Frontend files
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Stylesheet
│   └── app.js          # Frontend JavaScript
├── server.js           # Backend server
├── resume.db           # SQLite database
├── temp/              # Temporary files for LaTeX
└── package.json       # Project dependencies
```

## API Endpoints

- `POST /api/generate-resume`: Generate PDF resume
- `POST /api/save-template`: Save resume template
- `GET /api/templates`: Get all saved templates
- `GET /api/templates/:id`: Get specific template
- `DELETE /api/templates/:id`: Delete template

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Font Awesome for icons
- LaTeX community for document typesetting
- Express.js team for the web framework 