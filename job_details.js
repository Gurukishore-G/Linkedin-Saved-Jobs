// JavaScript to extract company names, job titles, and locations from ALL PAGES of LinkedIn saved jobs
// Run this in your Microsoft Edge browser console when viewing your LinkedIn saved jobs page

(function extractAllJobDetailsFromSavedJobs() {
    // Check if we're on the LinkedIn saved jobs page
    if (!window.location.href.includes('linkedin.com/my-items/saved-jobs')) {
        console.warn('⚠️ Please run this script on the LinkedIn saved jobs page: https://www.linkedin.com/my-items/saved-jobs/');
        return;
    }
    
    console.log('🔍 Starting to extract job details from ALL PAGES of LinkedIn saved jobs...');
    
    // Function to extract job details (company, title, location) from the current page
    function extractJobDetailsFromPage() {
        // Extract company names
        // const companyElements = document.querySelectorAll('div.OxRVYBPaMbQwEfslyYadmBWjwaQuFvi.t-14.t-black.t-normal');
        const companyElements = document.querySelectorAll('.pxUtFAnNAlQUqKbhgaSFYXfZujHHeMMyHYkPM.t-14.t-black.t-normal');
        
        // Extract job titles
        // const titleElements = document.querySelectorAll('span.mNiKOkGLXopRwvUjiHRjxdaEKEMEvBflk.t-16 a');
        const titleElements = document.querySelectorAll('.t-roman.t-sans .display-flex a');
        
        // Extract locations
        // const locationElements = document.querySelectorAll('div[class*="xIrTcpbeEHJpnjhTmlNxNrOBpJwtvTjpecBg"].t-14.t-normal');
        const locationElements = document.querySelectorAll('.dckMfiyJszFLylsZdQUdDdjNLVwdiBBmvz.t-14.t-normal');

        
        const jobDetails = [];
        const maxElements = Math.max(companyElements.length, titleElements.length, locationElements.length);
        
        for (let i = 0; i < maxElements; i++) {
            const company = i < companyElements.length ? companyElements[i].textContent.trim() : "N/A";
            const title = i < titleElements.length ? titleElements[i].textContent.trim().replace(/\s+/g, ' ') : "N/A";
            const location = i < locationElements.length ? locationElements[i].textContent.trim() : "N/A";
            
            jobDetails.push({
                company,
                title,
                location
            });
        }
        
        return jobDetails;
    }
    
    // Function to check if there's a Next button on the page
    function hasNextButton() {
        const nextButton = document.querySelector('button.artdeco-pagination__button--next:not([disabled])');
        return !!nextButton;
    }
    
    // Function to click the Next button and wait for the page to load
    async function clickNextButton() {
        const nextButton = document.querySelector('button.artdeco-pagination__button--next:not([disabled])');
        if (nextButton) {
            console.log('Clicking Next button to navigate to the next page...');
            nextButton.click();
            // Wait for the page to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            return true;
        }
        return false;
    }
    
    // Function to create a visual progress indicator
    function createProgressIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'linkedin-extractor-progress';
        indicator.style.position = 'fixed';
        indicator.style.top = '10px';
        indicator.style.right = '10px';
        indicator.style.backgroundColor = '#0a66c2';
        indicator.style.color = 'white';
        indicator.style.padding = '10px';
        indicator.style.borderRadius = '5px';
        indicator.style.zIndex = '9999';
        indicator.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        indicator.style.fontFamily = 'Arial, sans-serif';
        indicator.innerHTML = 'Extracting: 0 jobs found<br>Page: 1';
        document.body.appendChild(indicator);
        return indicator;
    }
    
    // Function to extract job details from all pages using pagination
    async function extractFromAllPages() {
        let allJobDetails = [];
        let currentPage = 1;
        const progressIndicator = createProgressIndicator();
        
        while (true) {
            console.log(`Processing page ${currentPage}...`);
            
            // Extract job details from current page
            const pageJobDetails = extractJobDetailsFromPage();
            console.log(`Found ${pageJobDetails.length} jobs on page ${currentPage}.`);
            
            // Add new job details to our list
            pageJobDetails.forEach(jobDetail => {
                allJobDetails.push(jobDetail);
                console.log(`Added job: ${jobDetail.title} at ${jobDetail.company} (${jobDetail.location})`);
            });
            
            // Update progress indicator
            progressIndicator.innerHTML = `Extracting: ${allJobDetails.length} jobs found<br>Page: ${currentPage}`;
            
            // Check if there's a next page
            if (!hasNextButton()) {
                console.log('No more pages. Extraction complete.');
                break;
            }
            
            // Navigate to the next page
            const navigated = await clickNextButton();
            if (!navigated) {
                console.log('Failed to navigate to next page. Stopping extraction.');
                break;
            }
            
            currentPage++;
        }
        
        // Remove the progress indicator
        document.body.removeChild(progressIndicator);
        return allJobDetails;
    }
    
    // Function to download CSV file with all job details
    function downloadCSV(jobDetails, filename = 'linkedin_saved_jobs.csv') {
        // Add job count to filename
        filename = `linkedin_saved_jobs_${jobDetails.length}_items.csv`;
        
        // Create CSV header and content
        const header = 'Company Name,Job Title,Location\n';
        const rows = jobDetails.map(job => 
            `"${job.company.replace(/"/g, '""')}","${job.title.replace(/"/g, '""')}","${job.location.replace(/"/g, '""')}"`
        );
        const csvContent = header + rows.join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Create a modal to show extraction results
    function showResultsModal(jobDetails) {
        // Create modal container
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.borderRadius = '5px';
        modalContent.style.padding = '20px';
        modalContent.style.maxWidth = '800px'; // Wider to accommodate more columns
        modalContent.style.maxHeight = '80%';
        modalContent.style.overflow = 'auto';
        modalContent.style.fontFamily = 'Arial, sans-serif';
        modalContent.style.position = 'relative'; // For close button positioning
        
        // Add heading
        const heading = document.createElement('h2');
        heading.textContent = `Extraction Complete: ${jobDetails.length} Jobs Found`;
        heading.style.color = '#0a66c2';
        heading.style.marginTop = '0';
        modalContent.appendChild(heading);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = '#0a66c2';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '3px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => document.body.removeChild(modal);
        modalContent.appendChild(closeButton);
        
        // Add download message
        const downloadMsg = document.createElement('p');
        downloadMsg.textContent = `A CSV file with ${jobDetails.length} jobs has been downloaded to your computer.`;
        modalContent.appendChild(downloadMsg);
        
        // Add job details table
        const tableContainer = document.createElement('div');
        tableContainer.style.maxHeight = '500px';
        tableContainer.style.overflow = 'auto';
        tableContainer.style.border = '1px solid #ddd';
        tableContainer.style.padding = '0';
        tableContainer.style.marginTop = '15px';
        
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['#', 'Company', 'Job Title', 'Location'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.padding = '8px';
            th.style.backgroundColor = '#f2f2f2';
            th.style.borderBottom = '2px solid #ddd';
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        jobDetails.forEach((job, index) => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #ddd';
            
            // Index column
            const indexCell = document.createElement('td');
            indexCell.textContent = index + 1;
            indexCell.style.padding = '8px';
            row.appendChild(indexCell);
            
            // Company column
            const companyCell = document.createElement('td');
            companyCell.textContent = job.company;
            companyCell.style.padding = '8px';
            row.appendChild(companyCell);
            
            // Title column
            const titleCell = document.createElement('td');
            titleCell.textContent = job.title;
            titleCell.style.padding = '8px';
            row.appendChild(titleCell);
            
            // Location column
            const locationCell = document.createElement('td');
            locationCell.textContent = job.location;
            locationCell.style.padding = '8px';
            row.appendChild(locationCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        modalContent.appendChild(tableContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    // Main execution
    (async function() {
        console.log('Extracting job details from ALL pages of saved jobs...');
        
        try {
            const jobDetails = await extractFromAllPages();
            
            console.log(`✅ Extraction complete! Found ${jobDetails.length} jobs across all pages:`);
            console.table(jobDetails);
            
            // Download the results as CSV
            downloadCSV(jobDetails);
            console.log('📥 CSV file has been downloaded to your downloads folder.');
            
            // Show results in a modal
            showResultsModal(jobDetails);
            
            return jobDetails;
        } catch (error) {
            console.error('❌ Error during extraction:', error);
            alert('An error occurred during extraction. See console for details.');
        }
    })();
})();
