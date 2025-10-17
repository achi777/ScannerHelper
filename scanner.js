const SCANNER_HELPER_URL = 'http://127.0.0.1:8765';
const UPLOAD_URL = 'https://dateloves.com/scanner/upload.php';

let scannedImageData = null;
let openCvReady = false;

// Check OpenCV.js loading status
let cvLoadCheckInterval = null;

// Start checking for OpenCV.js
function startCvLoadCheck() {
    if (cvLoadCheckInterval) return;

    cvLoadCheckInterval = setInterval(() => {
        if (typeof cv !== 'undefined' && cv.getBuildInformation) {
            clearInterval(cvLoadCheckInterval);
            cvLoadCheckInterval = null;
            onOpenCvReady();
        }
    }, 100);
}

// OpenCV.js ready callback
function onOpenCvReady() {
    openCvReady = true;
    console.log('[INFO] OpenCV.js loaded successfully');
    console.log('[INFO] OpenCV version:', cv.getBuildInformation());

    const statusEl = document.getElementById('statusMessage');
    if (statusEl && statusEl.textContent.includes('helper')) {
        // Don't override scanner helper status
    } else {
        showStatus('✅ OpenCV.js ჩაიტვირთა წარმატებით', 'success');
    }
}

// Make it global for HTML onload
window.onOpenCvReady = onOpenCvReady;

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.classList.remove('hidden');

    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    }
}

// Check if scanner helper is running
async function checkScannerHelper() {
    try {
        const response = await fetch(`${SCANNER_HELPER_URL}/status`, {
            method: 'GET',
            mode: 'cors'
        });

        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Start scanning
async function startScan() {
    const scanBtn = document.getElementById('scanBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const previewContainer = document.getElementById('previewContainer');

    // Check if helper is running
    const helperRunning = await checkScannerHelper();
    if (!helperRunning) {
        showStatus('❌ სკანერის helper აპლიკაცია არ მუშაობს. გთხოვთ, გაუშვათ scanner_helper.exe', 'error');
        return;
    }

    // Disable scan button and show loading
    scanBtn.disabled = true;
    showStatus('⏳ სკანირება მიმდინარეობს...', 'info');
    previewContainer.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${SCANNER_HELPER_URL}/scan`, {
            method: 'GET',
            mode: 'cors'
        });

        const result = await response.json();

        if (result.success && result.image) {
            scannedImageData = result.image;

            // Show preview
            previewContainer.innerHTML = `<img src="${result.image}" alt="Scanned Document">`;

            // Show crop, upload and cancel buttons
            const cropBtn = document.getElementById('cropBtn');
            cropBtn.classList.remove('hidden');
            uploadBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');

            showStatus('✅ სკანირება წარმატებით დასრულდა. დააჭირეთ "ამოჭრას" დოკუმენტის გამოსაყოფად', 'success');
        } else {
            throw new Error(result.error || 'სკანირება ვერ მოხერხდა');
        }
    } catch (error) {
        console.error('Scan error:', error);
        showStatus(`❌ შეცდომა: ${error.message}`, 'error');
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>დოკუმენტის პრევიუ გამოჩნდება აქ</p>
            </div>
        `;
    } finally {
        scanBtn.disabled = false;
    }
}

// Detect and crop document using OpenCV.js with advanced detection
async function cropDocument() {
    if (!scannedImageData) {
        showStatus('❌ სკანირებული დოკუმენტი არ არსებობს', 'error');
        return;
    }

    if (!openCvReady) {
        showStatus('⏳ OpenCV.js ჯერ იტვირთება... გთხოვთ დაელოდოთ', 'info');
        return;
    }

    const cropBtn = document.getElementById('cropBtn');
    const previewContainer = document.getElementById('previewContainer');

    cropBtn.disabled = true;
    showStatus('🔍 დოკუმენტის ძიება და ამოჭრა მიმდინარეობს...', 'info');

    // Show processing overlay
    const processingOverlay = document.createElement('div');
    processingOverlay.className = 'processing-overlay';
    processingOverlay.innerHTML = `
        <div class="spinner"></div>
        <div class="processing-text">დოკუმენტის დამუშავება...</div>
    `;
    previewContainer.appendChild(processingOverlay);

    try {
        // Wait a bit for UI to update
        await new Promise(resolve => setTimeout(resolve, 100));

        const croppedImageData = await detectAndCropDocument(scannedImageData);

        if (croppedImageData) {
            // Update scanned image with cropped version
            scannedImageData = croppedImageData;

            // Remove overlay
            processingOverlay.remove();

            // Show cropped preview
            previewContainer.innerHTML = `<img src="${croppedImageData}" alt="Cropped Document">`;

            showStatus('✅ დოკუმენტი წარმატებით ამოიჭრა!', 'success');
        } else {
            processingOverlay.remove();
            showStatus('⚠️ დოკუმენტი ვერ მოიძებნა. ორიგინალი დარჩა', 'error');
        }
    } catch (error) {
        console.error('Crop error:', error);
        processingOverlay.remove();
        showStatus(`❌ შეცდომა: ${error.message}`, 'error');
    } finally {
        cropBtn.disabled = false;
    }
}

// Advanced document detection with multiple strategies
async function detectAndCropDocument(imageDataUrl) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.onload = function() {
                try {
                    console.log('[INFO] Processing image:', img.width, 'x', img.height);

                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Load image into OpenCV
                    let src = cv.imread(canvas);

                    // Try multiple detection strategies
                    let bestRect = null;

                    // Strategy 1: Standard edge detection (best for clear edges)
                    console.log('[INFO] Trying Strategy 1: Standard edge detection');
                    bestRect = detectWithEdges(src, 75, 200, 0.015);

                    // Strategy 2: More sensitive edge detection
                    if (!bestRect) {
                        console.log('[INFO] Trying Strategy 2: Sensitive edge detection');
                        bestRect = detectWithEdges(src, 50, 150, 0.02);
                    }

                    // Strategy 3: Even more sensitive
                    if (!bestRect) {
                        console.log('[INFO] Trying Strategy 3: More sensitive edge detection');
                        bestRect = detectWithEdges(src, 30, 100, 0.03);
                    }

                    // Strategy 4: Very sensitive edge detection
                    if (!bestRect) {
                        console.log('[INFO] Trying Strategy 4: Very sensitive edge detection');
                        bestRect = detectWithEdges(src, 20, 80, 0.04);
                    }

                    // Strategy 5: Adaptive threshold
                    if (!bestRect) {
                        console.log('[INFO] Trying Strategy 5: Adaptive threshold detection');
                        bestRect = detectWithAdaptiveThreshold(src);
                    }

                    // Strategy 6: Very loose detection (for difficult cases)
                    if (!bestRect) {
                        console.log('[INFO] Trying Strategy 6: Very loose detection');
                        bestRect = detectWithLooseConstraints(src);
                    }

                    // Strategy 7: Largest rectangle fallback
                    if (!bestRect) {
                        console.log('[INFO] Trying Strategy 7: Largest rectangle fallback');
                        bestRect = detectLargestRectangle(src);
                    }

                    if (bestRect && bestRect.bestContour) {
                        console.log('[INFO] Found document! Area:', bestRect.area);

                        // Get corner points - handle both Int32 and Float32 data
                        const points = [];
                        const contour = bestRect.bestContour;

                        for (let i = 0; i < 4; i++) {
                            if (contour.data32S && contour.data32S.length >= 8) {
                                points.push({
                                    x: contour.data32S[i * 2],
                                    y: contour.data32S[i * 2 + 1]
                                });
                            } else if (contour.data32F && contour.data32F.length >= 8) {
                                points.push({
                                    x: Math.round(contour.data32F[i * 2]),
                                    y: Math.round(contour.data32F[i * 2 + 1])
                                });
                            } else {
                                console.error('[ERROR] Unexpected contour data format');
                                resolve(null);
                                return;
                            }
                        }

                        console.log('[INFO] Corner points:', points);

                        // Order points: top-left, top-right, bottom-right, bottom-left
                        const orderedPoints = orderPoints(points);

                        // Calculate dimensions
                        const widthTop = Math.hypot(
                            orderedPoints[1].x - orderedPoints[0].x,
                            orderedPoints[1].y - orderedPoints[0].y
                        );
                        const widthBottom = Math.hypot(
                            orderedPoints[2].x - orderedPoints[3].x,
                            orderedPoints[2].y - orderedPoints[3].y
                        );
                        const maxWidth = Math.max(widthTop, widthBottom);

                        const heightLeft = Math.hypot(
                            orderedPoints[3].x - orderedPoints[0].x,
                            orderedPoints[3].y - orderedPoints[0].y
                        );
                        const heightRight = Math.hypot(
                            orderedPoints[2].x - orderedPoints[1].x,
                            orderedPoints[2].y - orderedPoints[1].y
                        );
                        const maxHeight = Math.max(heightLeft, heightRight);

                        console.log('[INFO] Document dimensions:', Math.round(maxWidth), 'x', Math.round(maxHeight));

                        // Perform perspective transform
                        const croppedDataUrl = perspectiveTransform(src, orderedPoints, maxWidth, maxHeight);

                        console.log('[SUCCESS] Document cropped successfully');

                        bestRect.bestContour.delete();
                        resolve(croppedDataUrl);
                    } else {
                        console.log('[WARNING] No suitable document found with any strategy');
                        resolve(null);
                    }

                    // Cleanup
                    src.delete();

                } catch (error) {
                    console.error('[ERROR] OpenCV processing error:', error);
                    reject(error);
                }
            };

            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };

            img.src = imageDataUrl;

        } catch (error) {
            reject(error);
        }
    });
}

// Strategy: Edge detection based
function detectWithEdges(src, cannyLow, cannyHigh, approxEpsilon) {
    let gray = new cv.Mat();
    let blurred = new cv.Mat();
    let edges = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Apply Gaussian blur
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

        // Edge detection
        cv.Canny(blurred, edges, cannyLow, cannyHigh, 3, false);

        // Morphological operations to connect edges and close gaps
        let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
        cv.dilate(edges, edges, kernel, new cv.Point(-1, -1), 2);
        cv.erode(edges, edges, kernel, new cv.Point(-1, -1), 1);
        kernel.delete();

        // Find contours
        cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        console.log(`[INFO] Found ${contours.size()} contours with Canny(${cannyLow}, ${cannyHigh})`);

        // Find best rectangular contour
        let maxArea = 0;
        let bestContour = null;
        const imageArea = src.rows * src.cols;
        const minArea = imageArea * 0.10; // At least 10% of image (reduced for better detection)
        const maxArea_limit = imageArea * 0.98; // At most 98% (allow larger documents)

        for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);

            if (area > minArea && area < maxArea_limit) {
                let peri = cv.arcLength(cnt, true);
                let approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, approxEpsilon * peri, true);

                // Look for 4-sided or near-4-sided polygons (rectangles with rounded corners)
                // Accept 4, 5, 6, 7, 8 sides (rounded corners create extra vertices)
                if ((approx.rows >= 4 && approx.rows <= 8) && area > maxArea) {
                    // Additional check: should form a convex shape
                    if (cv.isContourConvex(approx)) {
                        // Use minAreaRect to get bounding rectangle even for rounded shapes
                        let rect = cv.minAreaRect(cnt);
                        let aspectRatio = Math.max(rect.size.width, rect.size.height) /
                                         Math.min(rect.size.width, rect.size.height);

                        // Accept aspect ratios between 1.2 and 3.0 (covers ID, passport, A4)
                        // Passport open: ~2.4, ID: ~1.6, A4: ~1.4
                        if (aspectRatio >= 1.2 && aspectRatio <= 3.5) {
                            console.log(`[DEBUG] Found candidate: ${approx.rows} vertices, aspect ratio: ${aspectRatio.toFixed(2)}, area: ${area}`);
                            maxArea = area;
                            if (bestContour) bestContour.delete();

                            // For rounded corners, use the approximated polygon itself
                            // If it has more than 4 vertices, use minAreaRect to get 4 corners
                            if (approx.rows === 4) {
                                bestContour = approx.clone();
                            } else {
                                // Convert RotatedRect to 4 corner points manually
                                bestContour = rotatedRectToPoints(rect);
                            }
                        }
                    }
                }
                approx.delete();
            }
            cnt.delete();
        }

        return bestContour ? { bestContour, area: maxArea } : null;

    } finally {
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
    }
}

// Strategy: Adaptive threshold based
function detectWithAdaptiveThreshold(src) {
    let gray = new cv.Mat();
    let thresh = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Adaptive threshold
        cv.adaptiveThreshold(gray, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

        // Invert
        cv.bitwise_not(thresh, thresh);

        // Find contours
        cv.findContours(thresh, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        console.log(`[INFO] Found ${contours.size()} contours with adaptive threshold`);

        // Find best rectangular contour
        let maxArea = 0;
        let bestContour = null;
        const imageArea = src.rows * src.cols;
        const minArea = imageArea * 0.10; // At least 10% of image
        const maxArea_limit = imageArea * 0.98; // At most 98%

        for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);

            if (area > minArea && area < maxArea_limit) {
                let peri = cv.arcLength(cnt, true);
                let approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.03 * peri, true);

                // Accept 4-8 vertices (rounded corners)
                if ((approx.rows >= 4 && approx.rows <= 8) && area > maxArea) {
                    if (cv.isContourConvex(approx)) {
                        // Check aspect ratio
                        let rect = cv.minAreaRect(cnt);
                        let aspectRatio = Math.max(rect.size.width, rect.size.height) /
                                         Math.min(rect.size.width, rect.size.height);

                        if (aspectRatio >= 1.2 && aspectRatio <= 3.5) {
                            console.log(`[DEBUG] Adaptive found: ${approx.rows} vertices, ratio: ${aspectRatio.toFixed(2)}`);
                            maxArea = area;
                            if (bestContour) bestContour.delete();

                            // Use approximated polygon or convert RotatedRect
                            if (approx.rows === 4) {
                                bestContour = approx.clone();
                            } else {
                                bestContour = rotatedRectToPoints(rect);
                            }
                        }
                    }
                }
                approx.delete();
            }
            cnt.delete();
        }

        return bestContour ? { bestContour, area: maxArea } : null;

    } finally {
        gray.delete();
        thresh.delete();
        contours.delete();
        hierarchy.delete();
    }
}

// Strategy: Very loose constraints for difficult cases
function detectWithLooseConstraints(src) {
    let gray = new cv.Mat();
    let blurred = new cv.Mat();
    let edges = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Apply median blur (better for noisy images)
        cv.medianBlur(gray, blurred, 5);

        // Very sensitive edge detection
        cv.Canny(blurred, edges, 10, 50, 3, false);

        // Aggressive morphological operations
        let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(7, 7));
        cv.dilate(edges, edges, kernel, new cv.Point(-1, -1), 3);
        cv.erode(edges, edges, kernel, new cv.Point(-1, -1), 2);
        kernel.delete();

        // Find contours
        cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        console.log(`[INFO] Found ${contours.size()} contours with loose constraints`);

        // Find best rectangular contour with very loose constraints
        let maxArea = 0;
        let bestContour = null;
        const imageArea = src.rows * src.cols;
        const minArea = imageArea * 0.08; // Even smaller - 8%
        const maxArea_limit = imageArea * 0.98;

        for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);

            if (area > minArea && area < maxArea_limit) {
                let peri = cv.arcLength(cnt, true);
                let approx = new cv.Mat();
                // Very loose approximation
                cv.approxPolyDP(cnt, approx, 0.05 * peri, true);

                // Accept 4-10 vertices
                if ((approx.rows >= 4 && approx.rows <= 10) && area > maxArea) {
                    if (cv.isContourConvex(approx)) {
                        let rect = cv.minAreaRect(cnt);
                        let aspectRatio = Math.max(rect.size.width, rect.size.height) /
                                         Math.min(rect.size.width, rect.size.height);

                        // Very loose aspect ratio
                        if (aspectRatio >= 1.1 && aspectRatio <= 4.0) {
                            console.log(`[DEBUG] Loose found: ${approx.rows} vertices, ratio: ${aspectRatio.toFixed(2)}`);
                            maxArea = area;
                            if (bestContour) bestContour.delete();

                            if (approx.rows === 4) {
                                bestContour = approx.clone();
                            } else {
                                bestContour = rotatedRectToPoints(rect);
                            }
                        }
                    }
                }
                approx.delete();
            }
            cnt.delete();
        }

        return bestContour ? { bestContour, area: maxArea } : null;

    } finally {
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
    }
}

// Strategy: Largest rectangle as last resort
function detectLargestRectangle(src) {
    let gray = new cv.Mat();
    let blurred = new cv.Mat();
    let edges = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        console.log('[INFO] Last resort: finding largest rectangle-like shape');

        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Multiple blur passes
        cv.GaussianBlur(gray, blurred, new cv.Size(9, 9), 0);

        // Try multiple Canny thresholds and combine
        let edges1 = new cv.Mat();
        let edges2 = new cv.Mat();
        let edges3 = new cv.Mat();

        cv.Canny(blurred, edges1, 10, 30, 3, false);
        cv.Canny(blurred, edges2, 30, 90, 3, false);
        cv.Canny(blurred, edges3, 50, 150, 3, false);

        // Combine all edge maps
        cv.bitwise_or(edges1, edges2, edges);
        cv.bitwise_or(edges, edges3, edges);

        edges1.delete();
        edges2.delete();
        edges3.delete();

        // Strong morphology
        let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9));
        cv.dilate(edges, edges, kernel, new cv.Point(-1, -1), 4);
        cv.erode(edges, edges, kernel, new cv.Point(-1, -1), 3);
        kernel.delete();

        // Find contours
        cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        console.log(`[INFO] Found ${contours.size()} contours in combined edge map`);

        // Find largest contour that's somewhat rectangular
        let maxArea = 0;
        let bestContour = null;
        const imageArea = src.rows * src.cols;
        const minArea = imageArea * 0.05; // 5% minimum

        for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);

            if (area > minArea && area > maxArea) {
                let peri = cv.arcLength(cnt, true);
                let approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.06 * peri, true);

                // Accept anything with 4+ vertices
                if (approx.rows >= 4) {
                    let rect = cv.minAreaRect(cnt);
                    let aspectRatio = Math.max(rect.size.width, rect.size.height) /
                                     Math.min(rect.size.width, rect.size.height);

                    // Very permissive
                    if (aspectRatio >= 1.0 && aspectRatio <= 5.0) {
                        console.log(`[DEBUG] Fallback found: ${approx.rows} vertices, ratio: ${aspectRatio.toFixed(2)}, area: ${area}`);
                        maxArea = area;
                        if (bestContour) bestContour.delete();

                        bestContour = rotatedRectToPoints(rect);
                    }
                }
                approx.delete();
            }
            cnt.delete();
        }

        return bestContour ? { bestContour, area: maxArea } : null;

    } finally {
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
    }
}

// Convert RotatedRect to 4 corner points
function rotatedRectToPoints(rotatedRect) {
    const angle = rotatedRect.angle * Math.PI / 180.0;
    const b = Math.cos(angle) * 0.5;
    const a = Math.sin(angle) * 0.5;

    const center = rotatedRect.center;
    const width = rotatedRect.size.width;
    const height = rotatedRect.size.height;

    // Calculate 4 corners
    const pt = [];

    pt.push({
        x: center.x - a * height - b * width,
        y: center.y + b * height - a * width
    });

    pt.push({
        x: center.x + a * height - b * width,
        y: center.y - b * height - a * width
    });

    pt.push({
        x: center.x + a * height + b * width,
        y: center.y - b * height + a * width
    });

    pt.push({
        x: center.x - a * height + b * width,
        y: center.y + b * height + a * width
    });

    // Convert to Mat format (CV_32S for Int32)
    const data = new Int32Array([
        Math.round(pt[0].x), Math.round(pt[0].y),
        Math.round(pt[1].x), Math.round(pt[1].y),
        Math.round(pt[2].x), Math.round(pt[2].y),
        Math.round(pt[3].x), Math.round(pt[3].y)
    ]);

    return cv.matFromArray(4, 1, cv.CV_32SC2, Array.from(data));
}

// Order points in clockwise order starting from top-left
function orderPoints(points) {
    // Sort by y-coordinate
    points.sort((a, b) => a.y - b.y);

    // Get top 2 and bottom 2 points
    const topPoints = points.slice(0, 2);
    const bottomPoints = points.slice(2, 4);

    // Sort top points by x (left to right)
    topPoints.sort((a, b) => a.x - b.x);
    const topLeft = topPoints[0];
    const topRight = topPoints[1];

    // Sort bottom points by x (left to right)
    bottomPoints.sort((a, b) => a.x - b.x);
    const bottomLeft = bottomPoints[0];
    const bottomRight = bottomPoints[1];

    return [topLeft, topRight, bottomRight, bottomLeft];
}

// Perform perspective transformation
function perspectiveTransform(src, orderedPoints, width, height) {
    const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        orderedPoints[0].x, orderedPoints[0].y,
        orderedPoints[1].x, orderedPoints[1].y,
        orderedPoints[2].x, orderedPoints[2].y,
        orderedPoints[3].x, orderedPoints[3].y
    ]);

    const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        width, 0,
        width, height,
        0, height
    ]);

    const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
    let warped = new cv.Mat();
    cv.warpPerspective(src, warped, M, new cv.Size(width, height));

    // Convert back to canvas
    const croppedCanvas = document.createElement('canvas');
    cv.imshow(croppedCanvas, warped);

    // Convert to data URL (JPEG for smaller size)
    const croppedDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);

    // Cleanup
    srcPoints.delete();
    dstPoints.delete();
    M.delete();
    warped.delete();

    return croppedDataUrl;
}

// Upload document to server
async function uploadDocument() {
    if (!scannedImageData) {
        showStatus('❌ სკანირებული დოკუმენტი არ არსებობს', 'error');
        return;
    }

    const uploadBtn = document.getElementById('uploadBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressBar = document.getElementById('uploadProgressBar');

    uploadBtn.disabled = true;
    cancelBtn.disabled = true;
    uploadProgress.classList.remove('hidden');
    showStatus('⏳ ფაილი იტვირთება...', 'info');

    try {
        // Convert base64 to blob
        const base64Data = scannedImageData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        // Create form data
        const formData = new FormData();
        formData.append('document', blob, `scan_${Date.now()}.jpg`);

        // Upload with progress
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                uploadProgressBar.style.width = percentComplete + '%';
                uploadProgressBar.textContent = percentComplete + '%';
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        showStatus(`✅ ფაილი წარმატებით აიტვირთა: ${response.filename}`, 'success');

                        // Reset after successful upload
                        setTimeout(() => {
                            resetInterface();
                        }, 2000);
                    } else {
                        throw new Error(response.message || 'ატვირთვა ვერ მოხერხდა');
                    }
                } catch (parseError) {
                    throw new Error('სერვერის პასუხის ანალიზი ვერ მოხერხდა');
                }
            } else {
                throw new Error(`სერვერის შეცდომა: ${xhr.status}`);
            }
        });

        xhr.addEventListener('error', () => {
            throw new Error('ქსელის შეცდომა');
        });

        xhr.open('POST', UPLOAD_URL, true);
        xhr.send(formData);

    } catch (error) {
        console.error('Upload error:', error);
        showStatus(`❌ შეცდომა: ${error.message}`, 'error');
        uploadBtn.disabled = false;
        cancelBtn.disabled = false;
        uploadProgress.classList.add('hidden');
    }
}

// Cancel and reset
function cancelScan() {
    resetInterface();
    showStatus('🔄 გაუქმებულია', 'info');
}

// Reset interface
function resetInterface() {
    scannedImageData = null;

    const scanBtn = document.getElementById('scanBtn');
    const cropBtn = document.getElementById('cropBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const previewContainer = document.getElementById('previewContainer');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressBar = document.getElementById('uploadProgressBar');

    scanBtn.disabled = false;
    cropBtn.classList.add('hidden');
    cropBtn.disabled = false;
    uploadBtn.classList.add('hidden');
    uploadBtn.disabled = false;
    cancelBtn.classList.add('hidden');
    cancelBtn.disabled = false;
    uploadProgress.classList.add('hidden');
    uploadProgressBar.style.width = '0%';
    uploadProgressBar.textContent = '0%';

    previewContainer.innerHTML = `
        <div class="preview-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>დოკუმენტის პრევიუ გამოჩნდება აქ</p>
        </div>
    `;
}

// Check scanner helper on page load
window.addEventListener('DOMContentLoaded', async () => {
    // Start OpenCV.js load check
    startCvLoadCheck();

    const helperRunning = await checkScannerHelper();
    if (helperRunning) {
        showStatus('✅ სკანერის helper აპლიკაცია მუშაობს', 'success');
    } else {
        showStatus('⚠️ სკანერის helper აპლიკაცია არ მუშაობს. გთხოვთ, გაუშვათ scanner_helper.exe', 'error');
    }
});
