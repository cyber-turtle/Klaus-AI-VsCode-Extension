"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const reactflow_1 = __importStar(require("reactflow"));
require("reactflow/dist/style.css");
require("./ThreadVisualization.css");
const d3Force = __importStar(require("d3-force"));
const ThreadNode = ({ data }) => {
    const { thread, isActive } = data;
    const date = new Date(thread.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
    return (<div className={`thread-node ${isActive ? 'active' : ''}`}>
            {/* Add explicit source handle */}
            <reactflow_1.Handle type="source" position={reactflow_1.Position.Right} id="source" style={{ background: '#555' }}/>

            <div className="thread-title">{thread.title}</div>
            <div className="thread-date">{date}</div>

            {/* Add explicit target handle */}
            <reactflow_1.Handle type="target" position={reactflow_1.Position.Left} id="target" style={{ background: '#555' }}/>
        </div>);
};
const nodeTypes = {
    threadNode: ThreadNode,
};
const ThreadVisualization = ({ threads, activeThreadId, onThreadSelect, onClose, }) => {
    const [nodes, setNodes, onNodesChange] = (0, reactflow_1.useNodesState)([]);
    const [edges, setEdges, onEdgesChange] = (0, reactflow_1.useEdgesState)([]);
    const [initialized, setInitialized] = (0, react_1.useState)(false);
    // Complete updated createGraphData function
    const createGraphData = (0, react_1.useCallback)(() => {
        if (!threads?.length)
            return;
        // Create nodes with initial positions spread out
        const flowNodes = threads.map((thread, index) => ({
            id: thread.id,
            type: 'threadNode',
            data: {
                thread,
                isActive: thread.id === activeThreadId,
            },
            // Give initial positions in a circle pattern
            position: {
                x: 400 + (Math.random() - 0.5) * 800,
                y: 300 + (Math.random() - 0.5) * 800
            },
        }));
        // Create edges - with additional validation
        const flowEdges = threads
            .filter(t => !!t.parentThreadId)
            .map(thread => {
            // Log each edge creation for debugging
            console.log(`Creating edge from ${thread.parentThreadId} to ${thread.id}`);
            return {
                id: `edge-${thread.parentThreadId}-${thread.id}`,
                source: thread.parentThreadId,
                target: thread.id,
                type: 'smoothstep',
                sourceHandle: 'source',
                targetHandle: 'target',
                animated: true,
                style: {
                    stroke: '#fff',
                    strokeWidth: 2
                },
                markerEnd: {
                    type: reactflow_1.MarkerType.ArrowClosed,
                    color: '#fff',
                    width: 15,
                    height: 15,
                },
            };
        });
        console.log("Created edges:", flowEdges);
        const d3NodesMap = new Map();
        const d3Nodes = flowNodes.map(node => {
            const d3Node = {
                ...node,
                x: node.position.x,
                y: node.position.y,
                id: node.id // Ensure ID is explicitly set
            };
            d3NodesMap.set(node.id, d3Node);
            return d3Node;
        });
        const d3Links = flowEdges
            .filter(edge => {
            const sourceExists = d3NodesMap.has(edge.source);
            const targetExists = d3NodesMap.has(edge.target);
            if (!sourceExists || !targetExists) {
                console.warn(`Skipping edge ${edge.id}: source or target node not found`);
            }
            return sourceExists && targetExists;
        })
            .map(edge => ({
            source: d3NodesMap.get(edge.source),
            target: d3NodesMap.get(edge.target),
            id: edge.id
        }));
        try {
            // Run simulation
            const simulation = d3Force.forceSimulation(d3Nodes)
                .force('link', d3Force.forceLink(d3Links)
                //@ts-expect-error
                .id(d => d.id)
                .distance(250) // Increase link distance
            )
                .force('charge', d3Force.forceManyBody()
                .strength(-1200) // Much stronger repulsion
                .distanceMax(800) // Limit the range of repulsion
            )
                .force('center', d3Force.forceCenter(400, 300))
                .force('collision', d3Force.forceCollide().radius(120)) // Larger collision radius
                .force('x', d3Force.forceX(400).strength(0.03)) // Gentle pull to center X
                .force('y', d3Force.forceY(300).strength(0.03)); // Gentle pull to center Y
            // Run the simulation longer for better layout
            for (let i = 0; i < 200; i++) {
                simulation.tick();
            }
            // Update node positions from simulation
            const positionedNodes = flowNodes.map(node => {
                const d3Node = d3Nodes.find(n => n.id === node.id);
                return {
                    ...node,
                    position: {
                        x: d3Node?.x ?? node.position.x,
                        y: d3Node?.y ?? node.position.y
                    },
                };
            });
            setNodes(positionedNodes);
            setEdges(flowEdges); // Set edges immediately
            // Add a better fit view approach
            setTimeout(() => {
                try {
                    // Force a re-fit after a short delay
                    const rfInstance = document.querySelector('.react-flow__renderer');
                    if (rfInstance) {
                        // Trigger window resize and ensure fitView is called
                        window.dispatchEvent(new Event('resize'));
                    }
                }
                catch (e) {
                    console.error("Error triggering fit view:", e);
                }
            }, 300);
        }
        catch (error) {
            console.error("Error in force simulation:", error);
            // Fallback to original nodes if simulation fails
            setNodes(flowNodes);
            setEdges(flowEdges);
        }
        setInitialized(true);
    }, [threads, activeThreadId, setNodes, setEdges]);
    (0, react_1.useEffect)(() => {
        createGraphData();
    }, [createGraphData]);
    // Add a debug effect to log nodes and edges
    (0, react_1.useEffect)(() => {
        console.log("Current nodes:", nodes);
        console.log("Current edges:", edges);
    }, [nodes, edges]);
    const handleNodeClick = (event, node) => {
        if (onThreadSelect) {
            onThreadSelect(node.id);
        }
    };
    return (<div className="thread-visualization-container">
            <div className="visualization-header">
                <h3>Thread Relationships</h3>
                {onClose && (<button className="close-button" onClick={onClose} type="button">
                        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>)}
            </div>
            <div className="thread-visualization">
                {nodes.length > 0 ? (<reactflow_1.default nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={handleNodeClick} nodeTypes={nodeTypes} defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { stroke: 'var(--vscode-editor-foreground)', strokeWidth: 2 },
                markerEnd: {
                    type: reactflow_1.MarkerType.ArrowClosed,
                    color: 'var(--vscode-editor-foreground)',
                    width: 15,
                    height: 15,
                },
            }} connectionLineType={reactflow_1.ConnectionLineType.SmoothStep} fitView attributionPosition="bottom-left" style={{ width: '100%', height: '100%' }}>
                        <reactflow_1.Controls />
                        <reactflow_1.Background color="#aaa" gap={16}/>
                    </reactflow_1.default>) : (<div className="no-threads-message">
                        {initialized ? "No thread relationships to display" : "Loading visualization..."}
                    </div>)}
            </div>
            <div className="visualization-legend">
                <div className="legend-item">
                    <div className="legend-node"/>
                    <span>Thread</span>
                </div>
                <div className="legend-item">
                    <div className="legend-node active"/>
                    <span>Active Thread</span>
                </div>
                <div className="legend-item">
                    <div className="legend-edge"/>
                    <span>Branch Relationship</span>
                </div>
            </div>
        </div>);
};
exports.default = ThreadVisualization;
//# sourceMappingURL=ThreadVisualization.js.map