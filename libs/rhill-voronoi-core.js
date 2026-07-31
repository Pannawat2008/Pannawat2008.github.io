/*!
Copyright (C) 2010-2013 Raymond Hill: https://github.com/gorhill/Javascript-Voronoi
MIT License: See https://github.com/gorhill/Javascript-Voronoi/LICENSE.md
*/
export class Voronoi {
    constructor() {
        this.vertices = null;
        this.edges = null;
        this.cells = null;
        this.toRecycle = null;
        this.beachsectionJunkyard = [];
        this.circleEventJunkyard = [];
        this.vertexJunkyard = [];
        this.edgeJunkyard = [];
        this.cellJunkyard = [];
    }

    reset() {
        if (!this.beachline) {
            this.beachline = new this.RBTree();
        }
        if (this.beachline.root) {
            var beachsection = this.beachline.getFirst(this.beachline.root);
            while (beachsection) {
                this.beachsectionJunkyard.push(beachsection);
                beachsection = beachsection.rbNext;
            }
        }
        this.beachline.root = null;
        if (!this.circleEvents) {
            this.circleEvents = new this.RBTree();
        }
        this.circleEvents.root = this.firstCircleEvent = null;
        this.vertices = [];
        this.edges = [];
        this.cells = [];
    }

    sqrt = Math.sqrt;
    abs = Math.abs;
    ε = 1e-9;
    invε = 1.0 / 1e-9;

    equalWithEpsilon(a, b) { return Math.abs(a - b) < 1e-9; }
    greaterThanWithEpsilon(a, b) { return a - b > 1e-9; }
    greaterThanOrEqualWithEpsilon(a, b) { return b - a < 1e-9; }
    lessThanWithEpsilon(a, b) { return b - a > 1e-9; }
    lessThanOrEqualWithEpsilon(a, b) { return a - b < 1e-9; }

    RBTree = class {
        constructor() { this.root = null; }
        rbInsertSuccessor(node, successor) {
            var parent;
            if (node) {
                successor.rbPrevious = node;
                successor.rbNext = node.rbNext;
                if (node.rbNext) { node.rbNext.rbPrevious = successor; }
                node.rbNext = successor;
                if (node.rbRight) {
                    node = node.rbRight;
                    while (node.rbLeft) { node = node.rbLeft; }
                    node.rbLeft = successor;
                } else { node.rbRight = successor; }
                parent = node;
            } else if (this.root) {
                node = this.getFirst(this.root);
                successor.rbPrevious = null;
                successor.rbNext = node;
                node.rbPrevious = successor;
                node.rbLeft = successor;
                parent = node;
            } else {
                successor.rbPrevious = successor.rbNext = null;
                this.root = successor;
                parent = null;
            }
            successor.rbLeft = successor.rbRight = null;
            successor.rbParent = parent;
            successor.rbRed = true;
            var grandpa, uncle;
            node = successor;
            while (parent && parent.rbRed) {
                grandpa = parent.rbParent;
                if (parent === grandpa.rbLeft) {
                    uncle = grandpa.rbRight;
                    if (uncle && uncle.rbRed) {
                        parent.rbRed = uncle.rbRed = false;
                        grandpa.rbRed = true;
                        node = grandpa;
                    } else {
                        if (node === parent.rbRight) {
                            this.rbRotateLeft(parent);
                            node = parent;
                            parent = node.rbParent;
                        }
                        parent.rbRed = false;
                        grandpa.rbRed = true;
                        this.rbRotateRight(grandpa);
                    }
                } else {
                    uncle = grandpa.rbLeft;
                    if (uncle && uncle.rbRed) {
                        parent.rbRed = uncle.rbRed = false;
                        grandpa.rbRed = true;
                        node = grandpa;
                    } else {
                        if (node === parent.rbLeft) {
                            this.rbRotateRight(parent);
                            node = parent;
                            parent = node.rbParent;
                        }
                        parent.rbRed = false;
                        grandpa.rbRed = true;
                        this.rbRotateLeft(grandpa);
                    }
                }
                parent = node.rbParent;
            }
            this.root.rbRed = false;
        }

        rbRemoveNode(node) {
            if (node.rbNext) { node.rbNext.rbPrevious = node.rbPrevious; }
            if (node.rbPrevious) { node.rbPrevious.rbNext = node.rbNext; }
            node.rbNext = node.rbPrevious = null;
            var parent = node.rbParent, left = node.rbLeft, right = node.rbRight, next;
            if (!left) { next = right; }
            else if (!right) { next = left; }
            else { next = this.getFirst(right); }
            if (parent) {
                if (parent.rbLeft === node) { parent.rbLeft = next; }
                else { parent.rbRight = next; }
            } else { this.root = next; }
            var isRed;
            if (left && right) {
                isRed = next.rbRed;
                next.rbRed = node.rbRed;
                next.rbLeft = left;
                left.rbParent = next;
                if (next !== right) {
                    parent = next.rbParent;
                    next.rbParent = node.rbParent;
                    node = next.rbRight;
                    parent.rbLeft = node;
                    next.rbRight = right;
                    right.rbParent = next;
                } else {
                    next.rbParent = parent;
                    parent = next;
                    node = next.rbRight;
                }
            } else {
                isRed = node.rbRed;
                node = next;
            }
            if (node) { node.rbParent = parent; }
            if (isRed) { return; }
            if (node && node.rbRed) { node.rbRed = false; return; }
            var sibling;
            do {
                if (node === this.root) { break; }
                if (node === parent.rbLeft) {
                    sibling = parent.rbRight;
                    if (sibling.rbRed) {
                        sibling.rbRed = false;
                        parent.rbRed = true;
                        this.rbRotateLeft(parent);
                        sibling = parent.rbRight;
                    }
                    if ((sibling.rbLeft && sibling.rbLeft.rbRed) || (sibling.rbRight && sibling.rbRight.rbRed)) {
                        if (!sibling.rbRight || !sibling.rbRight.rbRed) {
                            sibling.rbLeft.rbRed = false;
                            sibling.rbRed = true;
                            this.rbRotateRight(sibling);
                            sibling = parent.rbRight;
                        }
                        sibling.rbRed = parent.rbRed;
                        parent.rbRed = sibling.rbRight.rbRed = false;
                        this.rbRotateLeft(parent);
                        node = this.root;
                        break;
                    }
                } else {
                    sibling = parent.rbLeft;
                    if (sibling.rbRed) {
                        sibling.rbRed = false;
                        parent.rbRed = true;
                        this.rbRotateRight(parent);
                        sibling = parent.rbLeft;
                    }
                    if ((sibling.rbLeft && sibling.rbLeft.rbRed) || (sibling.rbRight && sibling.rbRight.rbRed)) {
                        if (!sibling.rbLeft || !sibling.rbLeft.rbRed) {
                            sibling.rbRight.rbRed = false;
                            sibling.rbRed = true;
                            this.rbRotateLeft(sibling);
                            sibling = parent.rbLeft;
                        }
                        sibling.rbRed = parent.rbRed;
                        parent.rbRed = sibling.rbLeft.rbRed = false;
                        this.rbRotateRight(parent);
                        node = this.root;
                        break;
                    }
                }
                sibling.rbRed = true;
                node = parent;
                parent = parent.rbParent;
            } while (!node.rbRed);
            if (node) { node.rbRed = false; }
        }

        rbRotateLeft(node) {
            var p = node, q = node.rbRight, parent = p.rbParent;
            if (parent) {
                if (parent.rbLeft === p) { parent.rbLeft = q; }
                else { parent.rbRight = q; }
            } else { this.root = q; }
            q.rbParent = parent;
            p.rbParent = q;
            p.rbRight = q.rbLeft;
            if (p.rbRight) { p.rbRight.rbParent = p; }
            q.rbLeft = p;
        }

        rbRotateRight(node) {
            var p = node, q = node.rbLeft, parent = p.rbParent;
            if (parent) {
                if (parent.rbLeft === p) { parent.rbLeft = q; }
                else { parent.rbRight = q; }
            } else { this.root = q; }
            q.rbParent = parent;
            p.rbParent = q;
            p.rbLeft = q.rbRight;
            if (p.rbLeft) { p.rbLeft.rbParent = p; }
            q.rbRight = p;
        }

        getFirst(node) {
            while (node.rbLeft) { node = node.rbLeft; }
            return node;
        }
        getLast(node) {
            while (node.rbRight) { node = node.rbRight; }
            return node;
        }
    };

    createCell(site) {
        var cell = this.cellJunkyard.pop();
        if (cell) {
            cell.site = site;
            cell.halfedges = [];
            cell.closeMe = false;
        } else {
            cell = { site: site, halfedges: [], closeMe: false };
        }
        return cell;
    }

    createVertex(x, y) {
        var v = this.vertexJunkyard.pop();
        if (!v) { v = { x: x, y: y }; }
        else { v.x = x; v.y = y; }
        return v;
    }

    createEdge(lSite, rSite, va, vb) {
        var edge = this.edgeJunkyard.pop();
        if (!edge) {
            edge = { lSite: lSite, rSite: rSite, va: va, vb: vb };
        } else {
            edge.lSite = lSite;
            edge.rSite = rSite;
            edge.va = va;
            edge.vb = vb;
        }
        return edge;
    }

    createHalfedge(edge, lSite, rSite) {
        var va, vb;
        if (lSite) {
            va = edge.va;
            vb = edge.vb;
        }
        return {
            site: lSite,
            edge: edge,
            angle: rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : (edge.va.a !== undefined ? edge.va.a : 0),
            getStartpoint: function() { return this.edge.lSite === this.site ? this.edge.va : this.edge.vb; },
            getEndpoint: function() { return this.edge.lSite === this.site ? this.edge.vb : this.edge.va; }
        };
    }

    // Fortune's Algorithm core logic
    compute(sites, bbox) {
        var startTime = new Date();

        this.reset();

        var siteEvents = sites.slice(0).sort(function(a, b) {
            var y = b.y - a.y;
            if (y) { return y; }
            return b.x - a.x;
        });

        var site = siteEvents.pop(),
            siteid = 0,
            xsite = Number.MIN_VALUE,
            ysite = Number.MIN_VALUE,
            cells = this.cells,
            circle;

        for (;;) {
            circle = this.firstCircleEvent;
            if (site && (!circle || site.y < circle.y || (site.y === circle.y && site.x < circle.x))) {
                if (site.x !== xsite || site.y !== ysite) {
                    cells[siteid] = this.createCell(site);
                    site.id = siteid++;
                    this.addBeachsection(site);
                    ysite = site.y;
                    xsite = site.x;
                }
                site = siteEvents.pop();
            }
            else if (circle) {
                this.removeBeachsection(circle.arc);
            }
            else {
                break;
            }
        }

        this.clipEdges(bbox);
        this.closeCells(bbox);

        var stopTime = new Date();
        return {
            cells: this.cells,
            edges: this.edges,
            vertices: this.vertices,
            execTime: stopTime.getTime() - startTime.getTime()
        };
    }

    addBeachsection(site) {
        var x = site.x,
            directrix = site.y,
            node = this.beachline.root,
            arc,
            lbArc,
            rbArc,
            dxd, dxd2;

        while (node) {
            dxd = this.leftBreakPoint(node, directrix);
            if (x < dxd) {
                node = node.rbLeft;
            } else {
                dxd2 = this.rightBreakPoint(node, directrix);
                if (x > dxd2) {
                    if (!node.rbRight) {
                        arc = node;
                        break;
                    }
                    node = node.rbRight;
                } else {
                    if (x > dxd) {
                        arc = node;
                        break;
                    }
                    if (x === dxd) {
                        arc = node;
                        break;
                    }
                    node = node.rbLeft;
                }
            }
        }

        var newArc = { site: site, rbRed: true };
        this.beachline.rbInsertSuccessor(arc, newArc);

        if (!arc) {
            return;
        }

        var newArc2 = { site: arc.site, rbRed: true };
        this.beachline.rbInsertSuccessor(newArc, newArc2);

        var edge = this.createEdge(arc.site, site);
        this.edges.push(edge);

        newArc.edge = newArc2.edge = edge;

        this.attachCircleEvent(arc);
        this.attachCircleEvent(newArc2);
    }

    removeBeachsection(arc) {
        var circle = arc.circleEvent,
            x = circle.x,
            y = circle.ycenter,
            vertex = this.createVertex(x, y);

        this.vertices.push(vertex);

        var predecessor = arc.rbPrevious,
            successor = arc.rbNext,
            disappearingArcs = [arc],
            node;

        this.detachCircleEvent(arc);

        var lArc = arc;
        while (lArc.circleEvent && Math.abs(x - lArc.circleEvent.x) < 1e-9 && Math.abs(y - lArc.circleEvent.ycenter) < 1e-9) {
            predecessor = lArc.rbPrevious;
            disappearingArcs.unshift(lArc);
            this.detachCircleEvent(lArc);
            lArc = lArc.rbPrevious;
        }
        disappearingArcs.unshift(lArc);
        this.detachCircleEvent(lArc);

        var rArc = arc;
        while (rArc.circleEvent && Math.abs(x - rArc.circleEvent.x) < 1e-9 && Math.abs(y - rArc.circleEvent.ycenter) < 1e-9) {
            successor = rArc.rbNext;
            disappearingArcs.push(rArc);
            this.detachCircleEvent(rArc);
            rArc = rArc.rbNext;
        }
        disappearingArcs.push(rArc);
        this.detachCircleEvent(rArc);

        var nArcs = disappearingArcs.length, iArc;
        for (iArc = 1; iArc < nArcs; iArc++) {
            rArc = disappearingArcs[iArc];
            lArc = disappearingArcs[iArc - 1];
            this.setEdgeStartpoint(rArc.edge, lArc.site, rArc.site, vertex);
        }

        lArc = disappearingArcs[0];
        rArc = disappearingArcs[nArcs - 1];
        rArc.edge = this.createEdge(lArc.site, rArc.site, vertex);
        this.edges.push(rArc.edge);

        this.detachCircleEvent(lArc);
        this.detachCircleEvent(rArc);

        this.attachCircleEvent(lArc);
        this.attachCircleEvent(rArc);

        for (iArc = 1; iArc < nArcs - 1; iArc++) {
            this.beachline.rbRemoveNode(disappearingArcs[iArc]);
        }
    }

    leftBreakPoint(node, directrix) {
        var site = node.site, rfxt = site.x, rfyt = site.y, pby = rfyt - directrix;
        if (!pby) { return rfxt; }
        var pbArc = node.rbPrevious;
        if (!pbArc) { return -Infinity; }
        site = pbArc.site;
        var lxt = site.x, lyt = site.y, pbx = lyt - directrix;
        if (!pbx) { return lxt; }
        var dxl = rfxt - lxt, dyl = 1 / pby - 1 / pbx, dxl2 = dxl * dxl;
        var a = dyl, b = 2 * (dxl / pbx - rfxt / pby + lxt / pbx), c = (rfxt * rfxt) / pby - (lxt * lxt) / pbx - dxl2 / pbx + pby - pbx;
        var disc = b * b - 4 * a * c;
        return (-b + Math.sqrt(disc)) / (2 * a);
    }

    rightBreakPoint(node, directrix) {
        var pbArc = node.rbNext;
        if (pbArc) { return this.leftBreakPoint(pbArc, directrix); }
        var site = node.site;
        return site.y === directrix ? site.x : Infinity;
    }

    attachCircleEvent(arc) {
        var lArc = arc.rbPrevious, rArc = arc.rbNext;
        if (!lArc || !rArc) { return; }
        var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
        if (lSite === rSite) { return; }

        var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
        var d = 2 * (ax * cy - ay * cx);
        if (d >= -2e-12) { return; }

        var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, ycenter = y + by;

        var circleEvent = {
            arc: arc,
            site: cSite,
            x: x + bx,
            y: ycenter + Math.sqrt(x * x + y * y),
            ycenter: ycenter
        };
        arc.circleEvent = circleEvent;

        var predecessor = null, node = this.circleEvents.root;
        while (node) {
            if (circleEvent.y < node.y || (circleEvent.y === node.y && circleEvent.x <= node.x)) {
                if (node.rbLeft) { node = node.rbLeft; }
                else { predecessor = node.rbPrevious; break; }
            } else {
                if (node.rbRight) { node = node.rbRight; }
                else { predecessor = node; break; }
            }
        }
        this.circleEvents.rbInsertSuccessor(predecessor, circleEvent);
        if (!predecessor) { this.firstCircleEvent = circleEvent; }
    }

    detachCircleEvent(arc) {
        if (arc.circleEvent) {
            if (!arc.circleEvent.rbPrevious) { this.firstCircleEvent = arc.circleEvent.rbNext; }
            this.circleEvents.rbRemoveNode(arc.circleEvent);
            arc.circleEvent = null;
        }
    }

    setEdgeStartpoint(edge, lSite, rSite, vertex) {
        if (!edge.va && !edge.vb) {
            edge.va = vertex;
            edge.lSite = lSite;
            edge.rSite = rSite;
        } else if (edge.lSite === rSite) {
            edge.vb = vertex;
        } else {
            edge.va = vertex;
        }
    }

    clipEdges(bbox) {
        var iEdge = this.edges.length, edge,
            abs = Math.abs,
            xl = bbox.xl, xr = bbox.xr, yt = bbox.yt, yb = bbox.yb;

        while (iEdge--) {
            edge = this.edges[iEdge];
            if (!this.connectEdge(edge, bbox) ||
                !this.clipEdge(edge, bbox) ||
                (abs(edge.va.x - edge.vb.x) < 1e-9 && abs(edge.va.y - edge.vb.y) < 1e-9)) {
                edge.va = edge.vb = null;
            }
        }
    }

    connectEdge(edge, bbox) {
        var vb = edge.vb;
        if (!!vb) { return true; }
        var va = edge.va,
            xl = bbox.xl, xr = bbox.xr, yt = bbox.yt, yb = bbox.yb,
            lSite = edge.lSite, rSite = edge.rSite,
            lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y,
            fx = (lx + rx) / 2, fy = (ly + ry) / 2,
            fm, fb;

        if (ry !== ly) {
            fm = (lx - rx) / (ry - ly);
            fb = fy - fm * fx;
        }

        if (fm === undefined) {
            if (fx < xl || fx >= xr) { return false; }
            if (lx > rx) {
                if (!va) { va = this.createVertex(fx, yt); }
                else if (va.y >= yb) { return false; }
                vb = this.createVertex(fx, yb);
            } else {
                if (!va) { va = this.createVertex(fx, yb); }
                else if (va.y < yt) { return false; }
                vb = this.createVertex(fx, yt);
            }
        } else if (fm < -1 || fm > 1) {
            if (lx > rx) {
                if (!va) { va = this.createVertex((yt - fb) / fm, yt); }
                else if (va.y >= yb) { return false; }
                vb = this.createVertex((yb - fb) / fm, yb);
            } else {
                if (!va) { va = this.createVertex((yb - fb) / fm, yb); }
                else if (va.y < yt) { return false; }
                vb = this.createVertex((yt - fb) / fm, yt);
            }
        } else {
            if (ly < ry) {
                if (!va) { va = this.createVertex(xl, fm * xl + fb); }
                else if (va.x >= xr) { return false; }
                vb = this.createVertex(xr, fm * xr + fb);
            } else {
                if (!va) { va = this.createVertex(xr, fm * xr + fb); }
                else if (va.x < xl) { return false; }
                vb = this.createVertex(xl, fm * xl + fb);
            }
        }
        edge.va = va;
        edge.vb = vb;
        return true;
    }

    clipEdge(edge, bbox) {
        var ax = edge.va.x, ay = edge.va.y, bx = edge.vb.x, by = edge.vb.y,
            t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay;

        var q = ax - bbox.xl;
        if (dx === 0 && q < 0) { return false; }
        var r = -q / dx;
        if (dx < 0) {
            if (r < t0) { return false; }
            if (r < t1) { t1 = r; }
        } else if (dx > 0) {
            if (r > t1) { return false; }
            if (r > t0) { t0 = r; }
        }

        q = bbox.xr - ax;
        if (dx === 0 && q < 0) { return false; }
        r = q / dx;
        if (dx < 0) {
            if (r > t1) { return false; }
            if (r > t0) { t0 = r; }
        } else if (dx > 0) {
            if (r < t0) { return false; }
            if (r < t1) { t1 = r; }
        }

        q = ay - bbox.yt;
        if (dy === 0 && q < 0) { return false; }
        r = -q / dy;
        if (dy < 0) {
            if (r < t0) { return false; }
            if (r < t1) { t1 = r; }
        } else if (dy > 0) {
            if (r > t1) { return false; }
            if (r > t0) { t0 = r; }
        }

        q = bbox.yb - ay;
        if (dy === 0 && q < 0) { return false; }
        r = q / dy;
        if (dy < 0) {
            if (r > t1) { return false; }
            if (r > t0) { t0 = r; }
        } else if (dy > 0) {
            if (r < t0) { return false; }
            if (r < t1) { t1 = r; }
        }

        if (t0 > 0) { edge.va = this.createVertex(ax + t0 * dx, ay + t0 * dy); }
        if (t1 < 1) { edge.vb = this.createVertex(ax + t1 * dx, ay + t1 * dy); }
        return true;
    }

    closeCells(bbox) {
        var xl = bbox.xl, xr = bbox.xr, yt = bbox.yt, yb = bbox.yb,
            cells = this.cells, iCell = cells.length, cell,
            iLeft, halfedges, nHalfedges, edge, va, vb, x, y;

        while (iCell--) {
            cell = cells[iCell];
            if (!cell || !cell.prepare()) { continue; }
            halfedges = cell.halfedges;
            nHalfedges = halfedges.length;
            iLeft = 0;

            while (iLeft < nHalfedges) {
                va = halfedges[iLeft].getEndpoint();
                vz = halfedges[(iLeft + 1) % nHalfedges].getStartpoint();
                if (Math.abs(va.x - vz.x) >= 1e-9 || Math.abs(va.y - vz.y) >= 1e-9) {
                    // close border
                    if (this.equalWithEpsilon(va.x, xl) && this.lessThanWithEpsilon(va.y, yb)) {
                        edge = this.createEdge(cell.site, null, va, this.createVertex(xl, this.equalWithEpsilon(vz.x, xl) ? vz.y : yb));
                    } else if (this.equalWithEpsilon(va.y, yb) && this.lessThanWithEpsilon(va.x, xr)) {
                        edge = this.createEdge(cell.site, null, va, this.createVertex(this.equalWithEpsilon(vz.y, yb) ? vz.x : xr, yb));
                    } else if (this.equalWithEpsilon(va.x, xr) && this.greaterThanWithEpsilon(va.y, yt)) {
                        edge = this.createEdge(cell.site, null, va, this.createVertex(xr, this.equalWithEpsilon(vz.x, xr) ? vz.y : yt));
                    } else if (this.equalWithEpsilon(va.y, yt) && this.greaterThanWithEpsilon(va.x, xl)) {
                        edge = this.createEdge(cell.site, null, va, this.createVertex(this.equalWithEpsilon(vz.y, yt) ? vz.x : xl, yt));
                    }
                    if (edge) {
                        this.edges.push(edge);
                        halfedges.splice(iLeft + 1, 0, this.createHalfedge(edge, cell.site, null));
                        nHalfedges = halfedges.length;
                    }
                }
                iLeft++;
            }
        }
    }
}
