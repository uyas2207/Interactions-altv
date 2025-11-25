import * as alt from 'alt-client';

// класс для создания и уничтожения визуальных элементов точки и колшейпов
export class PointVisuals {
    constructor(position, config = {}) {
        this.position = position;
        this.config = config;

        this.marker = null;
        this.colshape = null;
    }

    create() {
        const marker = new alt.Marker(
            this.config.markerType, 
            this.position, 
            this.config.color
        );
        marker.scale = this.config.scale;

        const colshape = new alt.ColshapeSphere(
            this.position.x, 
            this.position.y, 
            this.position.z + (this.config.heightOffset), 
            this.config.radius
        );

        return { marker, colshape };
    }

    destroy() {
        if (this.marker && this.marker.destroy) {
            this.marker.destroy();
            this.marker = null;
        }

        if (this.colshape && this.colshape.destroy) {
            this.colshape.destroy();
            this.colshape = null;
        }
    }
}