(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Group view

  TheGraph.Group = React.createClass({
    componentDidMount: function () {
      // Move group
      if (this.props.isSelectionGroup) {
        // Drag selection by bg
        this.refs.box.getDOMNode().addEventListener("trackstart", this.onTrackStart);
      } else {
        this.refs.label.getDOMNode().addEventListener("trackstart", this.onTrackStart);
      }

      // Don't pan under menu
      this.getDOMNode().addEventListener("trackstart", this.dontPan);
      
      // Tap to select this group
      if (this.props.onGroupSelection) {
        this.getDOMNode().addEventListener('tap', this.onGroupSelection);
      }

      // Context menu
      if (this.props.showContext) {
        this.getDOMNode().addEventListener("contextmenu", this.showContext);
        this.getDOMNode().addEventListener("hold", this.showContext);
      }

      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      this.componentDidUpdate();
    },
    onGroupSelection: function (event) {
      // This function copied from onNodeSelectin in the-graph-node.js
      // Don't tap app (unselect)
      // TODO: unselect nodes not in this group
      event.stopPropagation();
      // TODO: select nodes in this group?
      // Don't toggle, this is a group, we won't allow multi select for groups
      // var toggle = (TheGraph.metaKeyPressed || event .pointerType==="touch");
      var toggle = false;
      this.props.onGroupSelection(this.props.key, this.props.item /*.node*/, toggle)
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      event.stopPropagation();
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      var x = event.clientX;
      var y = event.clientY;

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.isSelectionGroup ? "selection" : "group"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: this.props.label,
        item: this.props.item
      });
    },
    getContext: function (menu, options, hide) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        label: this.props.label,
        triggerHideContext: hide
      });
    },
    dontPan: function (event) {
      // Don't drag under menu
      if (this.props.app.menuShown) {
        event.stopPropagation();
      }
    },
    onTrackStart: function (event) {
      // Don't drag graph
      event.stopPropagation();

      if (this.props.isSelectionGroup) {
        var box = this.refs.box.getDOMNode();
        box.addEventListener("track", this.onTrack);
        box.addEventListener("trackend", this.onTrackEnd);
      } else {
        var label = this.refs.label.getDOMNode();
        label.addEventListener("track", this.onTrack);
        label.addEventListener("trackend", this.onTrackEnd);
      }
    },
    onTrack: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      var deltaX = Math.round( event.ddx / this.props.scale );
      var deltaY = Math.round( event.ddy / this.props.scale );

      this.props.triggerMoveGroup(this.props.item.nodes, deltaX, deltaY);
    },
    onTrackEnd: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      // Don't tap graph (deselect)
      event.preventTap();

      // Snap to grid
      this.props.triggerMoveGroup(this.props.item.nodes);

      if (this.props.isSelectionGroup) {
        var box = this.refs.box.getDOMNode();
        box.removeEventListener("track", this.onTrack);
        box.removeEventListener("trackend", this.onTrackEnd);
      } else {
        var label = this.refs.label.getDOMNode();
        label.removeEventListener("track", this.onTrack);
        label.removeEventListener("trackend", this.onTrackEnd);
      }
    },
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      var c = "group-box color" + (this.props.color ? this.props.color : 0);
      if (this.props.isSelectionGroup) { 
        c += " selection drag";
      }
      this.refs.box.getDOMNode().setAttribute("class", c);
    },
    render: function() {
      var x = this.props.minX - TheGraph.nodeSize/2;
      var y = this.props.minY - TheGraph.nodeSize/2;
      var color = (this.props.color ? this.props.color : 0);
      return (
        React.DOM.g(
          {
            className: "group"
            // transform: "translate("+x+","+y+")"
          },
          React.DOM.rect({
            ref: "box",
            // className: "group-box color"+color, // See componentDidUpdate
            x: x,
            y: y,
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius,
            width: this.props.maxX - this.props.minX + TheGraph.nodeSize*2,
            height: this.props.maxY - this.props.minY + TheGraph.nodeSize*2
          }),
          React.DOM.text({
            ref: "label",
            className: "group-label drag",
            x: x + TheGraph.nodeRadius,
            y: y + 9,
            children: this.props.label
          }),
          React.DOM.text({
            className: "group-description",
            x: x + TheGraph.nodeRadius,
            y: y + 24,
            children: this.props.description
          })
        )
      );
    }
  });


})(this);