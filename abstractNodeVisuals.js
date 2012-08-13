/*
 * A general superclass for the a graphic engine used by nodes on the Pedigree graph. Contains
 * information about positioning of the graphical elements of the node
 */

var AbstractNodeVisuals = Class.create({

    initialize: function(node, x, y) {
        this._node = node;
        this._relativeX= x;
        this._relativeY = y;
        this._absoluteX = x;
        this._absoluteY = y;
    },

    /*
     * Returns the node for which the graphics are being drawn
     */
    getNode: function() {
        return this._node;
    },

    /*
     * Returns the x coordinate at which the node was originally drawn. Disregards transformation data.
     */
    getRelativeX: function() {
        return this._relativeX;
    },

    /*
     * Returns the y coordinate at which the node was originally drawn. Disregards transformation data.
     */
    getRelativeY: function() {
        return this._relativeY;
    },

    /*
     * Returns the current X coordinate of this node on the canvas, taking into consideration transformation data.
     */
    getX: function() {
        return this._absoluteX;
    },

    /*
     * Changes the X coordinate of the node
     *
     * @param x the x coordinate on the canvas
     * @param animate set to true if you want to animate the transition
     */
    setX: function(x, animate) {
        this.setPos(x, this.getY(), animate);
    },

    /*
     * Returns the current Y coordinate of this node on the canvas, taking into consideration transformation data.
     */
    getY: function() {
        return this._absoluteY;
    },

    /*
     * Changes the Y coordinate of the node
     *
     * @param y the y coordinate on the canvas
     * @param animate set to true if you want to animate the transition
     */
    setY: function(y, animate) {
        this.setPos(y, this.getX(), animate);
    },

    /*
     * Returns an array containing the x and y coordinates of the node on canvas.
     */
    getPos: function() {
        return [this.getX(), this.getY()];
    },

    /*
     * [Abstract Method]
     * Changes the position of the node to (X,Y)
     *
     * @param x the x coordinate on the canvas
     * @param y the y coordinate on the canvas
     * @param animate set to true if you want to animate the transition
     */
    setPos: function(x, y, animate) {
    },

    /*
     * Returns a Raphael set or element that contains all the graphics and labels associated with this node.
     */
    getAllGraphics: function() {
        return editor.getPaper().set();
    },

    /*
     * Updates the graphical elements of this node including labels, and brings them to front in the correct
     * layering order.
     */
    draw: function() {
        this.getAllGraphics().toFront();
    },

    /*
     * Removes all the graphical elements of this node from the canvas
     */
    remove: function() {
        this.getAllGraphics().remove();
    }
});