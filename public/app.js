document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resumeForm');
    const sections = document.querySelectorAll('.form-section');
    const progressSteps = document.querySelectorAll('.progress-step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const themeToggle = document.querySelector('.theme-toggle');
    let currentSection = 0;
    let selectedTemplate = 'modern';

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    // Template selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTemplate = card.dataset.template;
        });
    });

    // Navigation functionality
    function showSection(index) {
        sections.forEach((section, i) => {
            section.classList.toggle('active', i === index);
            progressSteps[i].classList.toggle('active', i <= index);
        });

        prevBtn.style.display = index === 0 ? 'none' : 'block';
        nextBtn.textContent = index === sections.length - 1 ? 'Generate Resume' : 'Next';
    }

    prevBtn.addEventListener('click', () => {
        if (currentSection > 0) {
            currentSection--;
            showSection(currentSection);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSection < sections.length - 1) {
            currentSection++;
            showSection(currentSection);
        } else {
            generateResume();
        }
    });

    // Skills management
    document.querySelectorAll('.skills-input').forEach(inputGroup => {
        const input = inputGroup.querySelector('input');
        const button = inputGroup.querySelector('button');
        const list = inputGroup.nextElementSibling;

        button.addEventListener('click', () => {
            const skill = input.value.trim();
            if (skill) {
                const skillTag = document.createElement('div');
                skillTag.className = 'skill-tag';
                skillTag.innerHTML = `
                    ${skill}
                    <button type="button" class="remove-skill">&times;</button>
                `;
                list.appendChild(skillTag);
                input.value = '';

                skillTag.querySelector('.remove-skill').addEventListener('click', () => {
                    skillTag.remove();
                });
            }
        });
    });

    // Form data collection
    function collectFormData() {
        const formData = {
            personal: {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                summary: document.getElementById('summary').value
            },
            education: [],
            experience: [],
            skills: {
                technical: Array.from(document.querySelectorAll('#technical-skills .skill-tag')).map(tag => 
                    tag.textContent.trim().replace('×', '')
                ),
                soft: Array.from(document.querySelectorAll('#soft-skills .skill-tag')).map(tag => 
                    tag.textContent.trim().replace('×', '')
                )
            },
            template: selectedTemplate
        };

        // Collect education entries
        document.querySelectorAll('.education-entry').forEach(entry => {
            formData.education.push({
                institution: entry.querySelector('input:nth-child(1)').value,
                degree: entry.querySelector('input:nth-child(2)').value,
                field: entry.querySelector('input:nth-child(3)').value,
                startDate: entry.querySelector('input:nth-child(4)').value,
                endDate: entry.querySelector('input:nth-child(5)').value,
                achievements: entry.querySelector('textarea').value
            });
        });

        // Collect experience entries
        document.querySelectorAll('.experience-entry').forEach(entry => {
            formData.experience.push({
                company: entry.querySelector('input:nth-child(1)').value,
                position: entry.querySelector('input:nth-child(2)').value,
                startDate: entry.querySelector('input:nth-child(3)').value,
                endDate: entry.querySelector('input:nth-child(4)').value,
                responsibilities: entry.querySelector('textarea').value
            });
        });

        return formData;
    }

    // Generate LaTeX and PDF
    async function generateResume() {
        const formData = collectFormData();
        
        try {
            const response = await fetch('/api/generate-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'resume.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                throw new Error('Failed to generate resume');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate resume. Please try again.');
        }
    }

    // Initialize
    showSection(0);
}); 