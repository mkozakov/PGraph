/*
 * Disorder is a class for managing visual representation and information regarding any
 * genetic disorder that is found in the OMIM database, and that can be attributed to
 * an individual in the Pedigree.
 *
 * @param disorderID the id number for the disorder, taken from the OMIM database
 * @param name a string representing the name of the disorder e.g. "Down Syndrome"
 */

var Disorder = Class.create( {

    initialize: function(disorderID, name, color, affectedNodes) {
        this._disorderID = disorderID;
        this._name = name;
        this._color = (color) ? color : this.generateColor();
        this._affectedNodes = (affectedNodes) ? affectedNodes : [];
    },

    /*
     * Returns the disorderID of the disorder
     */
    getDisorderID: function() {
        return this._disorderID;
    },

    /*
     * Replaces the ID of the disorder with the disorder ID passed. Does not update Legend!
     *
     * @param disorderID the id number for the disorder, taken from the OMIM database
     */
    setDisorderID: function(disorderID) {
        this._disorderID = disorderID;
    },

    /*
     * Returns the name of the disorder
     */
    getName: function() {
        return this._name;
    },

    /*
     * Replaces the name of the disorder with the name passed. Does not update Legend!
     *
     * @param name a string representing the name of the disorder e.g. "Down Syndrome"
     */
    setName: function(name) {
        this._name = name;
    },

    /*
     * Returns the color representing this disorder in the Legend
     */
    getColor: function() {
        return this._color;
    },

    /*
     * Replaces the color representing this disorder in the Legend with the given color. Does not update Legend!
     *
     * @param color is a string representing a CSS color e.g. 'blue' or '#DADADA'
     */
    setColor: function(color) {
        this._color = color;
    },

    /*
     * Returns the number of registered individuals carrying the disorder.
     */
    getNumAffected: function() {
        return this.getAffectedNodes().length;
    },

    getAffectedNodes: function() {
        return this._affectedNodes;
    },

    setAffectedNodes: function(nodes) {
        this._affectedNodes = nodes;
    },

    /*
     * Replaces the number of registered individuals carrying the disorder. Does not update Legend!
     *
     * @param numAffected is an integer greater than or equal to 0
     */
    addAffectedNode: function(node) {
        this._affectedNodes.indexOf(node) == -1 && this._affectedNodes.push(node);
    },

    /*
     * Subtracts one from the count of registered individuals carrying the disorder. Does not update Legend!
     */
    removeAffectedNode: function(node) {
        this._affectedNodes.indexOf(node) > -1 && (this._affectedNodes = this._affectedNodes.without(node));
    },

    /*
     * Generates a CSS color. Has preference for 5 colors that can be distinguished in gray-scale.
     */
    generateColor: function() {
        if(editor.getLegend().getDisorderColors().keys().indexOf(this.getDisorderID()) > -1) {
            return editor.getLegend().getDisorderColors().get(this.getDisorderID());
        }
        var usedColors = editor.getLegend().getDisorderColors().values(),
            prefColors = ["#FEE090", '#E0F3F8', '#91BFDB', '#4575B4'];
        usedColors.each( function(color) {
            prefColors = prefColors.without(color);
        });
        if(prefColors.length > 0) {
            return prefColors[0];
        }
        else {
            var randomColor = Raphael.getColor();
            while(randomColor == "#ffffff" || usedColors.indexOf(randomColor) != -1) {
                randomColor = "#"+((1<<24)*Math.random()|0).toString(16);
            }
            //TODO: add some kind of level of control for the colors.
            return randomColor;
        }
    }
});
