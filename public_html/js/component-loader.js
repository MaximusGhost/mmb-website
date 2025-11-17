/**
 * Modern Async Component Loader
 * Uses Fetch API instead of deprecated XMLHttpRequest
 */

(function() {
    'use strict';

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    /**
     * Fetch a component with retry logic
     * @param {string} componentName - Name of the component file (without .html)
     * @param {number} attempt - Current attempt number
     * @returns {Promise<string>} The component HTML content
     */
    async function fetchComponentWithRetry(componentName, attempt = 1) {
        try {
            const response = await fetch('components/' + componentName + '.html', {
                cache: 'no-cache',
                headers: {
                    'Accept': 'text/html'
                }
            });
            
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }
            
            return await response.text();
        } catch (error) {
            console.error('Attempt ' + attempt + ' failed to load ' + componentName + ':', error);
            
            if (attempt < MAX_RETRIES) {
                console.log('Retrying ' + componentName + ' in ' + RETRY_DELAY + 'ms...');
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return fetchComponentWithRetry(componentName, attempt + 1);
            }
            
            throw new Error('Failed to load ' + componentName + ' after ' + MAX_RETRIES + ' attempts');
        }
    }

    /**
     * Load a component and insert it into target element
     * @param {string} componentName - Name of the component file (without .html)
     * @param {string} targetId - ID of the element where component should be inserted
     * @returns {Promise<void>}
     */
    async function loadComponent(componentName, targetId) {
        const targetElement = document.getElementById(targetId);
        
        if (!targetElement) {
            console.error('Target element not found: ' + targetId);
            return;
        }

        try {
            const html = await fetchComponentWithRetry(componentName);
            targetElement.innerHTML = html;
            
            // Dispatch custom event to notify that component is loaded
            const event = new CustomEvent('componentLoaded', { 
                detail: { component: componentName } 
            });
            document.dispatchEvent(event);
            
            console.log('✓ Loaded component:', componentName);
        } catch (error) {
            console.error('✗ Failed to load component:', componentName, error);
            targetElement.innerHTML = '<p style="color:red;">Failed to load ' + componentName + '</p>';
        }
    }

    /**
     * Load head component into document head
     * @returns {Promise<void>}
     */
    async function loadHead() {
        try {
            const html = await fetchComponentWithRetry('head');
            
            // Create a temporary container to parse the HTML
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            // Append all nodes to the head
            while (temp.firstChild) {
                document.head.appendChild(temp.firstChild);
            }
            
            console.log('✓ Loaded head component');
        } catch (error) {
            console.error('✗ Failed to load head component:', error);
        }
    }

    /**
     * Load scripts component into document body
     * Scripts are loaded sequentially to ensure dependencies load in correct order
     * @returns {Promise<void>}
     */
    async function loadScripts() {
        try {
            const html = await fetchComponentWithRetry('scripts');
            
            // Create a temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            // Extract all script nodes
            const scriptNodes = Array.from(temp.querySelectorAll('script'));
            
            // Load scripts sequentially to maintain dependency order
            for (const node of scriptNodes) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    
                    // Copy all attributes
                    Array.from(node.attributes).forEach(attr => {
                        script.setAttribute(attr.name, attr.value);
                    });
                    
                    if (node.src) {
                        // External script - wait for it to load
                        script.onload = resolve;
                        script.onerror = reject;
                        script.src = node.src;
                    } else {
                        // Inline script - executes immediately
                        script.textContent = node.textContent;
                        setTimeout(resolve, 0);
                    }
                    
                    document.body.appendChild(script);
                });
            }
            
            console.log('✓ Loaded scripts component');
        } catch (error) {
            console.error('✗ Failed to load scripts component:', error);
        }
    }

    /**
     * Initialize all components in the correct order
     */
    async function initializeComponents() {
        try {
            // Load head first (contains CSS - critical for rendering)
            await loadHead();
            
            // Load header and footer in parallel (non-critical)
            await Promise.all([
                loadComponent('header', 'component-header'),
                loadComponent('footer', 'component-footer')
            ]);
            
            // Load scripts last
            await loadScripts();
            
            // Make body visible now that everything is loaded
            document.body.classList.add('loaded');
            
            console.log('✓ All components loaded successfully');
        } catch (error) {
            console.error('✗ Error initializing components:', error);
            // Make body visible even if there was an error
            document.body.classList.add('loaded');
        }
    }

    // Start loading components when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeComponents);
    } else {
        initializeComponents();
    }

    // Add visible class to footer after it loads (for animations)
    document.addEventListener('componentLoaded', function(e) {
        if (e.detail.component === 'footer') {
            const footer = document.querySelector('.footer');
            if (footer) {
                setTimeout(function() {
                    footer.classList.add('visible');
                }, 100);
            }
        }
    });
})();