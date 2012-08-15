
/*
 * A general superclass for nodes on the Pedigree graph. Contains connections
 * and basic information about gender, ID and a graphics element.
 *
 * @param x the x coordinate on the canvas
 * @param x the y coordinate on the canvas
 * @param gender should be "U", "F", or "M" depending on the gender
 * @param id the unique ID number of this node
 */

var AbstractPerson = Class.create(AbstractNode, {

    initialize: function($super, x, y, gender, id) {
        this._id = (id != null) ? id : editor.generateID();
        this._parentPartnership = null;
        this._partnerships = [];
        this._gender = this.parseGender(gender);
        $super(x, y);
      },

    /*
     * Initializes the object responsible for creating graphics for this node
     *
     * @param x the x coordinate on the canvas at which the node is centered
     * @param y the y coordinate on the canvas at which the node is centered
     */
    generateGraphics: function(x, y) {
        return new AbstractPersonVisuals(this, x, y);
    },

    /*
     * Reads a string of input and converts it into the standard gender format of "M","F" or "U".
     * Defaults to "U" if string is not recognized
     *
     * @param gender the string to be parsed
     */
    parseGender: function(gender) {
        return (gender == 'M' || gender == 'F')?gender:'U';
    },

    /*
     * Returns the unique ID of this node
     */
    getID: function() {
        return this._id;
    },

    /*
     * Returns "U", "F" or "M" depending on the gender of this node
     */
    getGender: function() {
        return this._gender;
    },

    /*
     * Updates the gender of this node and (optionally) updates the
     * graphics. Updates gender of all partners if it is unknown.
     * Returns an array of nodes visited during the partner traversal.
     *
     * @param gender should be "U", "F", or "M" depending on the gender
     * @param forceDraw set to true if you want to update the graphics
     * @param visitedNodes an array of nodes that were visited during the traversal up until
     *  this node. OMIT this parameter. It is used for internal functionality.
     */
    setGender: function(gender, forceDraw, visitedNodes) {
        var visited = (visitedNodes) ? visitedNodes : [];
        visited.push(this);
        if(this.getPartners().length == 0) {
            this._gender = this.parseGender(gender);
            forceDraw && this.getGraphics().drawShapes();
        }
        else if(this.getGender() == "U") {
            var me = this;
            this._gender = this.parseGender(gender);
            forceDraw && this.getGraphics().drawShapes();
            this.getPartners().each(function(partner) {
                if(visited.indexOf(partner) == -1) {
                    visited = partner.setGender(me.getOppositeGender(), forceDraw, visited);
                }
            });
        }
        return visited;
    },

    /*
     * Returns an array of Partnership objects of this node
     */
    getPartnerships: function() {
        return this._partnerships;
    },

    /*
     * Returns the Partnership affiliated with partner
     *
     * @partner can be a Person or a PlaceHolder
     */
    getPartnership: function(partner) {
        var partnerships = this.getPartnerships();
        for(var i = 0; i < partnerships.length; i++) {
            if(partnerships[i].getPartnerOf(this) == partner) {
                return partnerships[i];
            }
        }
        return null;
    },

    /*
     * Returns an array nodes that share a Partnership with this node
     */
    getPartners: function() {
        var partners = [];
        var me = this;
        this.getPartnerships().each(function(partnership) {
            var partner = partnership.getPartnerOf(me);
            partner && partners.push(partner);
        });
        return partners;
    },

    /*
     * Adds a new partnership to the list of partnerships of this node
     *
     * @param partnership is a Partnership object with this node as one of the partners
     */
    addPartnership: function(partnership) {
       if(this.getPartners().indexOf(partnership.getPartnerOf(this)) == -1) {
           this._partnerships.push(partnership);
       }
    },

    /*
     * Removes a partnership from the list of partnerships
     *
     * @param partnership is a Partnership object with this node as one of the partners
     */
    removePartnership: function(partnership) {
        this._partnerships = this._partnerships.without(partnership);
    },

    /*
     * Returns a Partnership containing this the parent nodes
     */
    getParentPartnership: function() {
        return this._parentPartnership;
    },

    /*
     * Replaces the parents Partnership with the one passed in the parameter
     *
     * @param partnership is a Partnership object that should have this node listed as a child
     */
    setParentPartnership: function(partnership) {
        this._parentPartnership = partnership;
    },

    /*
     * Returns an array containing the two parent AbstractPerson nodes of this node.
     */
    getParents: function() {
        if(this.getParentPartnership()){
            return [this.getParentPartnership().getPartners()[0], this.getParentPartnership().getPartners()[1]]
        }
        return null;
    },

    /*
     * Creates a Partnership of two new Person nodes of opposite gender, and sets parents to this partnership
     */
    createParents: function() {
        if(this.getParentPartnership() == null) {
            var mother = editor.addNode(this.getGraphics().getX() + 100, this.getGraphics().getY() - 250, "F", false),
                father = editor.addNode(this.getGraphics().getX() - 100, this.getGraphics().getY() - 250, "M", false),
                partnership = new Partnership(this.getX(), this.getY() - 250, mother, father);
            this.addParents(partnership);
        }
    },

    /*
     * Sets parents to the partnership passed in the parameter, and adds this node to partnership's list of children
     */
    addParents: function(partnership) {
        if(this.getParentPartnership() == null) {
            partnership.addChild(this);
        }
    },

    removeParents: function() {
        if(this.getParentPartnership()) {
            this.getParentPartnership().remove();
        }
    },

    /*
     * Returns a string representing the opposite gender of this node ("M" or "F"). Returns "U"
     * if the gender of this node is unknown
     */
    getOppositeGender : function() {
        if (this.getGender() == "U") {
            return "U";
        }
        else if(this.getGender() == "M") {
            return "F";
        }
        else {
            return "M";
        }
    },
    /*
     * Creates a new node and generates a Partnership with this node.
     * Returns the Partnership.
     *
     * @param isPlaceHolder set to true if the new partner should be a PlaceHolder
     */
    createPartner: function(isPlaceHolder) {
        //TODO: set x and y using positioning algorithm
        var x = this.getX() + 200,
            y = this.getY(),
            partner = editor.addNode(x, y, this.getOppositeGender(), isPlaceHolder);
        return this.addPartner(partner);
    },

    /*
     * Creates a new Partnership with the partner passed in the parameter.
     * Does not duplicate a partnership if one already exists.
     * Returns the new Partnership or the preexisting partnership
     *
     * @param partner a Person or PlaceHolder.
     */
    addPartner: function(partner) {
        if(this.getPartners().indexOf(partner) != -1){
            return this.getPartnership(partner);
        }
        else if(this.canPartnerWith(partner)) {
            //TODO: calculate partnership x and y
            var distanceX = Math.abs(partner.getX() - this.getX())/2;
            var distanceY = Math.abs(partner.getY() - this.getY())/2;
            var x = (partner.getX() > this.getX()) ? distanceX + this.getX() : distanceX + partner.getX();
            var y = (partner.getY() > this.getY()) ? distanceY + this.getY() : distanceY + partner.getY();

            var partnership = new Partnership(x, y, this, partner);

            if(this.getGender() == 'U' && partner.getGender() != 'U') {
                this.setGender(partner.getOppositeGender(), true, null);
            }
            else if(this.getGender() != 'U' && partner.getGender() == 'U') {
                partner.setGender(this.getOppositeGender(), true, null);
            }

            return partnership;
        }
    },

    /*
     * Returns an array of nodes that are children from all of this node's Partnerships.
     * The array can include PlaceHolders.
     */
    getChildren: function() {
        var children = [];
        this.getPartnerships().each(function(partnership) {
            children = children.concat(partnership.getChildren())
        });
        return children;
    },

    /*
     * Returns true if this node is a parent of otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isParentOf: function(otherNode) {
        return (this.getChildren().indexOf(otherNode) > -1);
    },

    /*
     * Returns true if this node is a descendant of otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isDescendantOf: function(otherNode) {
        if(otherNode.isParentOf(this)) {
            return true;
        }
        else {
            var found = false,
                children = otherNode.getChildren(),
                i = 0;
            while((i < children.length) && !found) {
                found = this.isDescendantOf(children[i]);
                i++;
            }
            return found;
        }
    },

    /*
     * Returns true if this node is an ancestor of otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isAncestorOf: function(otherNode) {
        return otherNode.isDescendantOf(this);
    },

    /*
     * Returns true if this node is a partner of otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isPartnerOf: function(otherNode) {
        return this.getPartners().indexOf(otherNode) > -1;
    },

    /*
     * Returns true if this node is related to otherNode
     *
     * @param otherNode can be a Person or a PlaceHolder
     */
    isRelatedTo: function(otherNode) {
        var getPersonNeighbors = function(node) {
            var neighbors = [];
            node.getParentPartnership() && neighbors.push(node.getParentPartnership().getPartner1(), node.getParentPartnership().getPartner2());
            neighbors = neighbors.concat(node.getChildren());
            neighbors = neighbors.concat(node.getPartners());
            return neighbors;
        };

        var front = [this],
            next = [],
            visited = {};
        visited[this.getID()] = true;
        while(front.length > 0) {
            for(var i = 0; i<front.length; i++) {
                var neighbors = getPersonNeighbors(front[i]);
                for(var k = 0; i<neighbors.length; k++) {
                    if(neighbors[k] == otherNode) {
                        return true;
                    }
                    else if(!visited[neighbors[k].getID()]) {
                        next.push(neighbors[k]);
                        visited[neighbors[k].getID()] = true;
                    }
                }
            }
            front.clear();
            front = next;
            next.clear();
        }
        return false;
    },

    /*
     * Returns true if this node can have a heterosexual Partnership with otherNode
     *
     * @param otherNode is a Person
     */
    canPartnerWith: function(otherNode) {
        var oppositeGender = (this.getOppositeGender() == otherNode.getGender() || this.getGender() == "U" || otherNode.getGender() == "U");
        var numSteps = this.getStepsToNode(otherNode)[0];
        var oddStepsAway = (numSteps == null || numSteps%2 == 1);
        return oppositeGender && oddStepsAway;
    },

    /*
     * Returns true if this node can be a parent of otherNode
     *
     * @param otherNode is a Person
     */
    canBeParentOf: function(otherNode) {
        var isDescendant = this.isDescendantOf(otherNode);
        return otherNode.getParentPartnership() == null && this.getChildren().indexOf(otherNode) == -1 && !isDescendant;
    },

    /*
     * Breaks connections with all related nodes and removes this node from
     * the record.
     * (Optional) Removes all descendant nodes and their relatives that will become unrelated to the proband as a result
     * (Optional) Removes all the graphics for this node and (optionally)
     * his descendants
     *
     * @param isRecursive set to true if you want to remove all unrelated descendants as well
     * @param removeVisuals set to true if you want to remove the graphics as well
     */
    remove: function(isRecursive, removeVisuals) {
        var me = this,
            toRemove = [],
            parents = this.getParents();
        if(parents) {
            (parents[0].getType() == 'ph') && parents[0].remove(false, true);
            (parents[1].getType() == 'ph') && parents[1].remove(false, true);
        }
        this.getPartnerships().each(function(partnership) {
            partnership.getChildren().each(function(child) {
                (child.getType() == 'ph') ? child.remove(false, true) : toRemove.push(child);
            });
            var partner = partnership.getPartnerOf(me);
            partner.getType() == 'ph' && partner.remove(false, true);
            partnership.remove();
        });
        isRecursive && toRemove.each(function(node) {
            !(node.isRelatedTo(me)) && node.remove(true, removeVisuals);
        });
        this.getParentPartnership() && this.getParentPartnership().removeChild(me);
        editor.removeNode(this);
        removeVisuals && this.getGraphics().remove();
    },

    /*
     * Returns the parent's Partnership
     */
    getUpperNeighbors: function() {
        this.getParentPartnership();
    },

    /*
     * Returns all of this node's Partnerships
     */
    getSideNeighbors: function() {
        return this.getPartnerships();
    },

    /*
     * Returns an array with the number of partnerships between this node and otherNode, and the nodes visited
     * in the process of the traversal
     *
     * @param otherNode an AbstractNode whose distance (in partnerships) from this node you're trying to calculate
     * @param visitedNodes an array of nodes that were visited in the result of the traversal. This parameter is used
     * internally so omit it when calling the function
     */
    getStepsToNode: function(otherNode, visitedNodes) {
        var visited = (visitedNodes) ? visitedNodes : [];
        visited.push(this);
        if(this === otherNode) {
            return [0, visited];
        }
        else {
            var numSteps = null;
            this.getPartners().each(function(partner) {
                if(visited.indexOf(partner) == -1) {
                    numSteps = partner.getStepsToNode(otherNode, visited)[0];
                    if(numSteps != null) {
                        numSteps = 1 + numSteps;
                        throw $break;
                    }
                }
            });
            return [numSteps, visited];
        }
    }
});