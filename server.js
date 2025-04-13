const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite database setup
const db = new sqlite3.Database(path.join(__dirname, 'resume.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

// LaTeX template generation
function generateLaTeX(data) {
    const { personal, education, experience, skills, template } = data;
    
    let latex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fontawesome5}
\\usepackage{fontspec}
\\usepackage{setspace}
\\usepackage{parskip}
\\usepackage{ragged2e}

\\geometry{a4paper, margin=0.75in}

% Colors
\\definecolor{primary}{RGB}{0, 51, 102}
\\definecolor{secondary}{RGB}{102, 102, 102}

% Font settings
\\setmainfont{Arial}
\\setlength{\\parindent}{0pt}

% Section formatting
\\titleformat{\\section}
  {\\normalfont\\Large\\bfseries\\color{primary}}
  {\\thesection}
  {1em}
  {}

\\titleformat{\\subsection}
  {\\normalfont\\large\\bfseries\\color{secondary}}
  {\\thesubsection}
  {1em}
  {}

\\titlespacing*{\\section}{0pt}{12pt}{6pt}
\\titlespacing*{\\subsection}{0pt}{8pt}{4pt}

\\begin{document}

\\begin{center}
{\\color{primary}\\huge\\textbf{${personal.fullName}}}\\\\[8pt]
{\\color{secondary}\\large
\\faIcon{envelope} ${personal.email} \\quad
\\faIcon{phone} ${personal.phone} \\quad
\\faIcon{map-marker-alt} ${personal.location}
}
\\end{center}

\\vspace{12pt}

\\section*{Professional Summary}
\\begin{spacing}{1.1}
${personal.summary}
\\end{spacing}

\\section*{Education}
\\begin{itemize}[leftmargin=*]
${education.map(edu => `
  \\item \\textbf{${edu.institution}}\\\\
        \\textit{${edu.degree} in ${edu.field}}\\\\
        ${edu.startDate} - ${edu.endDate}\\\\
        \\begin{itemize}[leftmargin=*]
          \\item ${edu.achievements}
        \\end{itemize}
`).join('')}
\\end{itemize}

\\section*{Work Experience}
\\begin{itemize}[leftmargin=*]
${experience.map(exp => `
  \\item \\textbf{${exp.company}}\\\\
        \\textit{${exp.position}}\\\\
        ${exp.startDate} - ${exp.endDate}\\\\
        \\begin{itemize}[leftmargin=*]
          \\item ${exp.responsibilities}
        \\end{itemize}
`).join('')}
\\end{itemize}

\\section*{Skills}
\\begin{itemize}[leftmargin=*]
  \\item \\textbf{Technical Skills:}\\\\
        \\begin{itemize}[leftmargin=*]
          ${skills.technical.map(skill => `\\item ${skill}`).join('\\\\')}
        \\end{itemize}
  \\item \\textbf{Soft Skills:}\\\\
        \\begin{itemize}[leftmargin=*]
          ${skills.soft.map(skill => `\\item ${skill}`).join('\\\\')}
        \\end{itemize}
\\end{itemize}

\\end{document}`;

    return latex;
}

// API Routes
app.post('/api/generate-resume', async (req, res) => {
    try {
        const latex = generateLaTeX(req.body);
        const filename = `resume_${Date.now()}`;
        const texPath = path.join(__dirname, 'temp', `${filename}.tex`);
        const pdfPath = path.join(__dirname, 'temp', `${filename}.pdf`);

        // Ensure temp directory exists
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        // Write LaTeX file
        fs.writeFileSync(texPath, latex);

        // Compile LaTeX to PDF
        exec(`pdflatex -output-directory=${path.join(__dirname, 'temp')} ${texPath}`, (error) => {
            if (error) {
                console.error('LaTeX compilation error:', error);
                return res.status(500).json({ error: 'Failed to generate PDF' });
            }

            // Read and send PDF
            const pdfBuffer = fs.readFileSync(pdfPath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=resume.pdf`);
            res.send(pdfBuffer);

            // Clean up temporary files
            fs.unlinkSync(texPath);
            fs.unlinkSync(pdfPath);
            fs.unlinkSync(path.join(__dirname, 'temp', `${filename}.aux`));
            fs.unlinkSync(path.join(__dirname, 'temp', `${filename}.log`));
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate resume' });
    }
});

// Save resume template
app.post('/api/save-template', (req, res) => {
    const { template, content } = req.body;
    
    db.run(
        'INSERT INTO resumes (template, content) VALUES (?, ?)',
        [template, JSON.stringify(content)],
        function(err) {
            if (err) {
                console.error('Error saving template:', err);
                return res.status(500).json({ error: 'Error saving template' });
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Get saved templates
app.get('/api/templates', (req, res) => {
    db.all('SELECT * FROM resumes ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching templates:', err);
            return res.status(500).json({ error: 'Error fetching templates' });
        }
        res.json(rows.map(row => ({
            ...row,
            content: JSON.parse(row.content)
        })));
    });
});

// Get a specific template
app.get('/api/templates/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM resumes WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching template:', err);
            return res.status(500).json({ error: 'Error fetching template' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json({
            ...row,
            content: JSON.parse(row.content)
        });
    });
});

// Delete a template
app.delete('/api/templates/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM resumes WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting template:', err);
            return res.status(500).json({ error: 'Error deleting template' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    });
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 