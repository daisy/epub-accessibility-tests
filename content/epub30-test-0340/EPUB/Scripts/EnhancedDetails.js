'use strict';

class EnhancedDetails {
    constructor(figure) {
        this.figure = figure;
        if (!this.details) {
            throw new Error(`No details found. Make sure that your figure contains a .${EnhancedDetails.classes.details}.`);
        }

        this.onDragstart = this.dragstartHandler.bind(this);
        this.onDragend = this.dragendHandler.bind(this);
        this.onDrag = this.dragHandler.bind(this);
        this.onToggle = this.toggleHandler.bind(this);

        this.onKeydown = this.keydownHandler.bind(this);
    }

    get details() {
        return this.figure.querySelector(`.${EnhancedDetails.classes.details}`);
    }

    get summary() {
        return this.figure.querySelector(`.${EnhancedDetails.classes.summary}`);
    }

    get detailsListeners() {
        return [
            ['toggle', this.onToggle],
            ['mousedown', this.onDragstart],
            ['mouseup', this.onDragend],
            ['mouseleave', this.onDragend],
            ['mousemove', this.onDrag],
        ];
    }

    get summaryListeners() {
        return [
            ['keydown', this.onKeydown],
        ];
    }

    get draggable() {
        return this.details.open && this.details.classList.contains(EnhancedDetails.classes.draggable);
    }

    get dragging() {
        return this.details.classList.contains(EnhancedDetails.classes.dragging)
    }

    set dragging(val) {
        if (val === true) {
            this.details.classList.add(EnhancedDetails.classes.dragging);
            this.details.style.cursor = 'grabbing';
        } else {
            this.details.classList.remove(EnhancedDetails.classes.dragging);
            this.details.style.cursor = null;
        }
    }

    dragstartHandler(e) {
        const path = (e.path || (e.composedPath && e.composedPath()));
        const { top, height } = this.details.getBoundingClientRect();
        const exclude = [
            // don't drag when the user is clicking the summary
            path.includes(this.summary),
            // only allow dragging on the top 32px
            (e.clientY - top) >= 32,
        ];
        if (!exclude.some(Boolean)) {
            this.dragging = true;
        }
    }

    dragendHandler(e) {
        this.dragging = false;
    }

    dragHandler({ movementX, movementY }) {
        if (this.draggable && this.dragging) {
            this.moveOverlay({ movementX, movementY });
        }
    }

    toggleHandler() {
        if (this.details.open) {
            this.details.classList.add(EnhancedDetails.classes.draggable);
            this.details.classList.add(EnhancedDetails.classes.resizable);
        } else {
            this.details.classList.remove(EnhancedDetails.classes.draggable);
            this.details.classList.remove(EnhancedDetails.classes.resizable);
            this.details.removeAttribute('style');
        }
    }

    keydownHandler(e) {
        const mod = (e.shiftKey) ? 20 : 1;
        const step = mod * 1;
        let left;
        let top;
        switch (e.key) {
            case 'ArrowRight':
                left = 5;
                break;
            case 'ArrowLeft':
                left = -5;
                break;
            case 'ArrowDown':
                top = 5;
                break;
            case 'ArrowUp':
                top = -5;
                break;
            case 'Home':
                e.preventDefault();
                this.resetOverlay();
                return;
            case 'Escape':
                this.details.open = false;
                return;
            default:
                return;
        }

        e.preventDefault();
        this.moveOverlay({
            movementX: left * step,
            movementY: top * step,
        });
    }

    moveOverlay({ movementX, movementY }) {
        let { top = 0, left = 0 } = window.getComputedStyle(this.details);
        top = ((top === 'auto') ? 0 : parseInt(top, 10)) + movementY;
        left = ((left === 'auto') ? 0 : parseInt(left, 10)) + movementX;
        EnhancedDetails.setStyle(this.details, {
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
        });
    }

    resetOverlay() {
        EnhancedDetails.setStyle(this.details, {
            position: null,
            top: null,
            left: null,
        });
    }

    addAlt() {
        const { alt } = this.figure.querySelector(`[aria-details=${this.details.id}]`);
        if (!alt) return;
        const altEl = document.createElement('div');
        altEl.innerHTML =
        `<section class="${EnhancedDetails.classes.alt}" aria-hidden="true">
            <h3>Alt Text</h3>
            <p>${alt}</p>
        </section>`;
        const content = this.details.querySelector(`.${EnhancedDetails.classes.content}`);
        if (content) {
            content.insertBefore(
                altEl.firstChild,
                content.firstElementChild,
            );
        } else {
            this.details.appendChild(altEl.firstChild);
        }
    }

    enable() {
        this.addAlt();
        this.detailsListeners.forEach(([...args]) => {
            this.details.addEventListener(...args);
        });

        this.summaryListeners.forEach(([...args]) => {
            this.summary.addEventListener(...args);
        });

        return this;
    }

    disable() {
        this.details.classList.remove(EnhancedDetails.classes.draggable);
        this.details.classList.remove(EnhancedDetails.classes.resizable);

        this.detailsListeners.forEach(([...args]) => {
            this.details.removeEventListener(...args);
        });

        this.summaryListeners.forEach(([...args]) => {
            this.summary.removeEventListener(...args);
        });

        return this;
    }

    static enhance(figure) {
        const od = new EnhancedDetails(figure);
        return od.enable();
    }

    static setStyle(el, styleObj) {
        Object.keys(styleObj).forEach((key) => {
            el.style[key] = styleObj[key];
        });
    };

    static get classes() {
        return {
            summary: 'overlaid__summary',
            details: 'overlaid__details',
            content: 'overlaid__content',
            alt: 'overlaid__alt-text',
            draggable: 'draggable',
            dragging: 'dragging',
            resizable: 'resizable',
        };
    }
}
