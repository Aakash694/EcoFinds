// EcoFinds Marketplace JavaScript

class EcoFinds {
    constructor() {
        this.currentView = 'homeView';
        this.currentCategory = 'all';
        this.currentLocation = 'all';
        this.listings = [];
        this.filteredListings = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.generateSampleListings();
        this.updateCategoryCounts();
        this.renderRecentListings();
        this.initAnimations();
    }

    bindEvents() {
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Category navigation
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCategoryChange(e.target.dataset.category));
        });

        // Category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.handleCategoryChange(category);
                this.showView('listingsView');
            });
        });

        // Location selector
        document.getElementById('locationSelect').addEventListener('change', (e) => {
            this.currentLocation = e.target.value;
            this.filterListings();
        });

        // View navigation
        document.getElementById('sellBtn').addEventListener('click', () => this.showView('sellView'));
        document.getElementById('viewAllBtn').addEventListener('click', () => this.showView('listingsView'));
        document.getElementById('backBtn').addEventListener('click', () => this.showView('homeView'));
        document.getElementById('cancelSell').addEventListener('click', () => this.showView('homeView'));

        // Sell form
        document.getElementById('sellForm').addEventListener('submit', (e) => this.handleSellSubmit(e));

        // Character counters
        document.getElementById('sellTitle').addEventListener('input', (e) => {
            document.getElementById('titleCharCount').textContent = e.target.value.length;
        });
        document.getElementById('sellDescription').addEventListener('input', (e) => {
            document.getElementById('descCharCount').textContent = e.target.value.length;
        });

        // Photo upload
        document.getElementById('sellPhotos').addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Filters
        document.getElementById('sortSelect').addEventListener('change', () => this.filterListings());
        document.getElementById('applyFilters').addEventListener('click', () => this.applyPriceFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Footer links
        const footerCategoryLinks = document.querySelectorAll('footer [data-category]');
        footerCategoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCategoryChange(e.target.dataset.category);
                this.showView('listingsView');
            });
        });

        // Smooth scroll for mobile
        this.addSmoothScrolling();
    }

    generateSampleListings() {
        const sampleData = [
            {
                id: 1,
                title: "iPhone 13 Pro Max 128GB",
                description: "Excellent condition, barely used. Original box and accessories included.",
                price: 75000,
                category: "mobiles",
                location: "mumbai",
                seller: "Raj Kumar",
                phone: "9876543210",
                images: ["https://via.placeholder.com/300x200/667eea/ffffff?text=iPhone+13+Pro"],
                postedAt: new Date('2024-01-15'),
                condition: "Like New"
            },
            {
                id: 2,
                title: "Maruti Swift VXI 2018",
                description: "Well maintained car, single owner, all services done at authorized dealer.",
                price: 550000,
                category: "cars",
                location: "delhi",
                seller: "Priya Sharma",
                phone: "9876543211",
                images: ["https://via.placeholder.com/300x200/764ba2/ffffff?text=Swift+VXI"],
                postedAt: new Date('2024-01-10'),
                condition: "Good"
            },
            {
                id: 3,
                title: "MacBook Pro 13\" M1",
                description: "Perfect for students and professionals. Fast performance, great battery life.",
                price: 95000,
                category: "electronics",
                location: "bangalore",
                seller: "Amit Patel",
                phone: "9876543212",
                images: ["https://via.placeholder.com/300x200/00D4AA/ffffff?text=MacBook+Pro"],
                postedAt: new Date('2024-01-12'),
                condition: "Excellent"
            },
            {
                id: 4,
                title: "Wooden Dining Table Set",
                description: "6-seater dining table with chairs. Solid wood, excellent craftsmanship.",
                price: 25000,
                category: "furniture",
                location: "pune",
                seller: "Sneha Reddy",
                phone: "9876543213",
                images: ["https://via.placeholder.com/300x200/FD79A8/ffffff?text=Dining+Table"],
                postedAt: new Date('2024-01-08'),
                condition: "Very Good"
            },
            {
                id: 5,
                title: "Designer Sarees Collection",
                description: "Beautiful silk sarees, worn only once. Perfect for weddings and festivals.",
                price: 8000,
                category: "fashion",
                location: "chennai",
                seller: "Lakshmi Iyer",
                phone: "9876543214",
                images: ["https://via.placeholder.com/300x200/FDCB6E/ffffff?text=Silk+Sarees"],
                postedAt: new Date('2024-01-14'),
                condition: "Like New"
            },
            {
                id: 6,
                title: "2BHK Apartment for Rent",
                description: "Spacious 2BHK with modern amenities, great location, available immediately.",
                price: 35000,
                category: "real-estate",
                location: "hyderabad",
                seller: "Vikram Singh",
                phone: "9876543215",
                images: ["https://via.placeholder.com/300x200/E84393/ffffff?text=2BHK+Flat"],
                postedAt: new Date('2024-01-11'),
                condition: "Excellent"
            },
            {
                id: 7,
                title: "Engineering Textbooks Set",
                description: "Complete set of computer science engineering books. All in good condition.",
                price: 3500,
                category: "books",
                location: "kolkata",
                seller: "Rohit Das",
                phone: "9876543216",
                images: ["https://via.placeholder.com/300x200/6C5CE7/ffffff?text=CS+Books"],
                postedAt: new Date('2024-01-09'),
                condition: "Good"
            },
            {
                id: 8,
                title: "Cricket Kit Complete Set",
                description: "Professional cricket kit with bat, pads, helmet, and gear bag. Barely used.",
                price: 12000,
                category: "sports",
                location: "mumbai",
                seller: "Arjun Kapoor",
                phone: "9876543217",
                images: ["https://via.placeholder.com/300x200/00B894/ffffff?text=Cricket+Kit"],
                postedAt: new Date('2024-01-13'),
                condition: "Very Good"
            }
        ];

        this.listings = sampleData;
        this.filteredListings = [...this.listings];
    }

    updateCategoryCounts() {
        const categories = ['cars', 'mobiles', 'electronics', 'furniture', 'fashion', 'real-estate', 'books', 'sports'];
        
        categories.forEach(category => {
            const count = this.listings.filter(item => item.category === category).length;
            const countElements = document.querySelectorAll(`[data-category-count="${category}"]`);
            countElements.forEach(el => {
                el.textContent = `${count} ads`;
            });
        });
    }

    renderRecentListings() {
        const recentListings = this.listings
            .sort((a, b) => b.postedAt - a.postedAt)
            .slice(0, 6);

        const grid = document.getElementById('listingsGrid');
        grid.innerHTML = recentListings.map(listing => this.createListingCard(listing)).join('');

        // Add click events to listing cards
        setTimeout(() => {
            const cards = grid.querySelectorAll('.listing-card');
            cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    const listingId = parseInt(e.currentTarget.dataset.listingId);
                    this.showListingDetail(listingId);
                });
            });
        }, 100);
    }

    createListingCard(listing) {
        const timeAgo = this.getTimeAgo(listing.postedAt);
        
        return `
            <div class="listing-card" data-listing-id="${listing.id}" style="
                background: var(--glass);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            " onmouseover="this.style.transform='translateY(-10px) scale(1.02)'; this.style.boxShadow='var(--shadow-hover)'"
               onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow)'">
                <div style="
                    height: 200px;
                    background: url('${listing.images[0]}') center/cover;
                    position: relative;
                ">
                    <div style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: var(--gradient-3);
                        color: var(--white);
                        padding: 0.25rem 0.75rem;
                        border-radius: 15px;
                        font-size: 0.75rem;
                        font-weight: 600;
                    ">${listing.condition}</div>
                </div>
                <div style="padding: 1.5rem;">
                    <h3 style="
                        color: var(--white);
                        font-size: 1.25rem;
                        margin-bottom: 0.5rem;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    ">${listing.title}</h3>
                    <p style="
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 0.875rem;
                        margin-bottom: 1rem;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    ">${listing.description}</p>
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                    ">
                        <span style="
                            background: var(--gradient-2);
                            color: var(--white);
                            padding: 0.5rem 1rem;
                            border-radius: 25px;
                            font-weight: 600;
                            font-size: 1.1rem;
                        ">₹ ${listing.price.toLocaleString()}</span>
                        <span style="
                            color: var(--primary);
                            font-size: 0.875rem;
                        ">
                            <i class="fas fa-map-marker-alt"></i> ${listing.location}
                        </span>
                    </div>
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 1rem;
                        border-top: 1px solid var(--glass-border);
                    ">
                        <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">
                            <i class="fas fa-clock"></i> ${timeAgo}
                        </span>
                        <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">
                            <i class="fas fa-user"></i> ${listing.seller}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    showListingDetail(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing) return;

        const detailView = document.getElementById('listingDetail');
        const timeAgo = this.getTimeAgo(listing.postedAt);

        detailView.innerHTML = `
            <div style="
                background: var(--glass);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                overflow: hidden;
                margin-bottom: 2rem;
            ">
                <div style="
                    height: 400px;
                    background: url('${listing.images[0]}') center/cover;
                    position: relative;
                ">
                    <div style="
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: var(--gradient-3);
                        color: var(--white);
                        padding: 0.5rem 1rem;
                        border-radius: 25px;
                        font-weight: 600;
                    ">${listing.condition}</div>
                </div>
                
                <div style="padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
                        <div>
                            <h1 style="
                                color: var(--white);
                                font-size: 2.5rem;
                                margin-bottom: 1rem;
                                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                            ">${listing.title}</h1>
                            <div style="
                                background: var(--gradient-2);
                                color: var(--white);
                                padding: 1rem 2rem;
                                border-radius: 50px;
                                font-weight: 700;
                                font-size: 2rem;
                                display: inline-block;
                                margin-bottom: 1rem;
                            ">₹ ${listing.price.toLocaleString()}</div>
                        </div>
                    </div>

                    <div style="
                        display: grid;
                        grid-template-columns: 2fr 1fr;
                        gap: 2rem;
                        margin-bottom: 2rem;
                    ">
                        <div>
                            <h3 style="
                                color: var(--primary);
                                font-size: 1.5rem;
                                margin-bottom: 1rem;
                            ">Description</h3>
                            <p style="
                                color: rgba(255, 255, 255, 0.9);
                                font-size: 1.1rem;
                                line-height: 1.8;
                            ">${listing.description}</p>
                        </div>

                        <div style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid var(--glass-border);
                            border-radius: 15px;
                            padding: 1.5rem;
                        ">
                            <h3 style="
                                color: var(--primary);
                                font-size: 1.25rem;
                                margin-bottom: 1rem;
                            ">Seller Details</h3>
                            <div style="margin-bottom: 1rem;">
                                <span style="color: var(--white); font-weight: 600;">
                                    <i class="fas fa-user"></i> ${listing.seller}
                                </span>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <span style="color: rgba(255, 255, 255, 0.8);">
                                    <i class="fas fa-map-marker-alt"></i> ${listing.location}
                                </span>
                            </div>
                            <div style="margin-bottom: 2rem;">
                                <span style="color: rgba(255, 255, 255, 0.8);">
                                    <i class="fas fa-clock"></i> Posted ${timeAgo}
                                </span>
                            </div>
                            <button onclick="ecoFinds.contactSeller('${listing.phone}', '${listing.seller}')" style="
                                background: var(--gradient-2);
                                color: var(--white);
                                border: none;
                                padding: 1rem 2rem;
                                border-radius: 50px;
                                font-weight: 600;
                                cursor: pointer;
                                width: 100%;
                                font-size: 1.1rem;
                                transition: all 0.3s ease;
                            " onmouseover="this.style.transform='translateY(-3px)'"
                               onmouseout="this.style.transform='none'">
                                <i class="fas fa-phone"></i> Contact Seller
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showView('detailView');
    }

    contactSeller(phone, name) {
        this.showToast(`Calling ${name} at ${phone}...`, 'success');
        // In a real app, this would initiate a phone call or show contact details
        setTimeout(() => {
            alert(`Contact ${name} at: ${phone}`);
        }, 1000);
    }

    handleSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        if (!query) {
            this.filteredListings = [...this.listings];
        } else {
            this.filteredListings = this.listings.filter(listing =>
                listing.title.toLowerCase().includes(query) ||
                listing.description.toLowerCase().includes(query) ||
                listing.category.toLowerCase().includes(query)
            );
        }
        this.updateListingsView();
        this.showView('listingsView');
    }

    handleCategoryChange(category) {
        this.currentCategory = category;
        
        // Update active state
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.filterListings();
    }

    filterListings() {
        let filtered = [...this.listings];

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(listing => listing.category === this.currentCategory);
        }

        // Filter by location
        if (this.currentLocation !== 'all') {
            filtered = filtered.filter(listing => listing.location === this.currentLocation);
        }

        // Apply price filters
        const minPrice = document.getElementById('minPrice')?.value;
        const maxPrice = document.getElementById('maxPrice')?.value;
        
        if (minPrice) {
            filtered = filtered.filter(listing => listing.price >= parseInt(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(listing => listing.price <= parseInt(maxPrice));
        }

        // Apply sorting
        const sortBy = document.getElementById('sortSelect')?.value || 'newest';
        this.sortListings(filtered, sortBy);

        this.filteredListings = filtered;
        this.updateListingsView();
    }

    sortListings(listings, sortBy) {
        switch (sortBy) {
            case 'newest':
                listings.sort((a, b) => b.postedAt - a.postedAt);
                break;
            case 'oldest':
                listings.sort((a, b) => a.postedAt - b.postedAt);
                break;
            case 'price-low':
                listings.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                listings.sort((a, b) => b.price - a.price);
                break;
        }
    }

    updateListingsView() {
        const grid = document.getElementById('filteredListingsGrid');
        const title = document.getElementById('listingsTitle');
        const count = document.getElementById('resultsCount');

        if (grid) {
            grid.innerHTML = this.filteredListings.map(listing => this.createListingCard(listing)).join('');
            
            // Add click events
            setTimeout(() => {
                const cards = grid.querySelectorAll('.listing-card');
                cards.forEach(card => {
                    card.addEventListener('click', (e) => {
                        const listingId = parseInt(e.currentTarget.dataset.listingId);
                        this.showListingDetail(listingId);
                    });
                });
            }, 100);
        }

        if (title) {
            const categoryName = this.currentCategory === 'all' ? 'All' : 
                this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
            title.textContent = `${categoryName} Listings`;
        }

        if (count) {
            count.textContent = `${this.filteredListings.length} results`;
        }
    }

    applyPriceFilters() {
        this.filterListings();
        this.showToast('Filters applied!', 'success');
    }

    clearFilters() {
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('sortSelect').value = 'newest';
        this.filterListings();
        this.showToast('Filters cleared!', 'success');
    }

    handleSellSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newListing = {
            id: Date.now(),
            title: formData.get('title') || document.getElementById('sellTitle').value,
            description: formData.get('description') || document.getElementById('sellDescription').value,
            price: parseInt(document.getElementById('sellPrice').value),
            category: document.getElementById('sellCategory').value,
            location: document.getElementById('sellLocation').value,
            seller: document.getElementById('sellName').value,
            phone: document.getElementById('sellPhone').value,
            images: ['https://via.placeholder.com/300x200/667eea/ffffff?text=New+Item'],
            postedAt: new Date(),
            condition: 'Good'
        };

        // Validate required fields
        if (!newListing.title || !newListing.description || !newListing.price || 
            !newListing.category || !newListing.location || !newListing.seller || !newListing.phone) {
            this.showToast('Please fill all required fields!', 'error');
            return;
        }

        // Add to listings
        this.listings.unshift(newListing);
        this.filteredListings = [...this.listings];
        
        // Reset form
        document.getElementById('sellForm').reset();
        document.getElementById('titleCharCount').textContent = '0';
        document.getElementById('descCharCount').textContent = '0';
        document.getElementById('photoPreview').innerHTML = '';
        
        // Update UI
        this.updateCategoryCounts();
        this.renderRecentListings();
        
        // Show success and redirect
        this.showToast('Your ad has been posted successfully!', 'success');
        setTimeout(() => {
            this.showView('homeView');
        }, 2000);
    }

    handlePhotoUpload(e) {
        const files = e.target.files;
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = '';

        if (files.length > 0) {
            preview.style.display = 'flex';
            preview.style.flexWrap = 'wrap';
            preview.style.gap = '1rem';
            preview.style.marginTop = '1rem';

            Array.from(files).slice(0, 12).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('div');
                    img.style.cssText = `
                        width: 100px;
                        height: 100px;
                        background: url('${e.target.result}') center/cover;
                        border-radius: 10px;
                        border: 2px solid var(--glass-border);
                        position: relative;
                        cursor: pointer;
                    `;
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                    removeBtn.style.cssText = `
                        position: absolute;
                        top: -5px;
                        right: -5px;
                        background: var(--error);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        font-size: 12px;
                        cursor: pointer;
                    `;
                    removeBtn.onclick = () => img.remove();
                    
                    img.appendChild(removeBtn);
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        document.getElementById(viewId).classList.add('active');
        this.currentView = viewId;
        
        // Update listings view if needed
        if (viewId === 'listingsView') {
            this.updateListingsView();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    initAnimations() {
        // Animate category cards on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, observerOptions);

        // Observe category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });

        // Add parallax effect to hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero-section');
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });

        // Add loading shimmer effect
        this.addShimmerEffect();
    }

    addShimmerEffect() {
        const style = document.createElement('style');
        style.textContent = `
            .shimmer {
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.1) 25%, 
                    rgba(255,255,255,0.2) 50%, 
                    rgba(255,255,255,0.1) 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    addSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize the application
const ecoFinds = new EcoFinds();

// Add some global utility functions
window.ecoFinds = ecoFinds;

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    