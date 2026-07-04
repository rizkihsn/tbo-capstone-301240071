"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ParseTreeNode } from '@/services/cfg/CFG';

interface ParseTreeVisualizerProps {
  data: ParseTreeNode;
}

export default function ParseTreeVisualizer({ data }: ParseTreeVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    // Bersihkan SVG sebelumnya (saat re-render)
    d3.select(svgRef.current).selectAll("*").remove();

    // Dimensi yang responsif menyesuaikan container
    const width = containerRef.current.clientWidth;
    const height = 400; // Tinggi tetap, atau bisa responsif
    const marginTop = 40;
    const marginRight = 40;
    const marginBottom = 40;
    const marginLeft = 40;

    // Persiapkan layout Tree menggunakan D3
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<ParseTreeNode>().size([width - marginLeft - marginRight, height - marginTop - marginBottom]);
    treeLayout(root);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font-family: sans-serif;");

    const g = svg.append("g")
      .attr("transform", `translate(${marginLeft},${marginTop})`);

    // Menggambar Garis/Edge antar node
    const link = g.append("g")
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 2)
      .selectAll("path")
      .data(root.links() as unknown as d3.HierarchyPointLink<ParseTreeNode>[])
      .join("path")
      .attr("d", d3.linkVertical<d3.HierarchyPointLink<ParseTreeNode>, d3.HierarchyPointNode<ParseTreeNode>>()
        .x(d => d.x)
        .y(d => d.y)
      )
      .attr("stroke-dasharray", function() {
        const length = (this as SVGPathElement).getTotalLength();
        return `${length} ${length}`;
      })
      .attr("stroke-dashoffset", function() {
        return (this as SVGPathElement).getTotalLength();
      })
      .transition()
      .duration(800)
      .delay(d => (d.source.depth * 500) + 300) // Animasi merambat dari atas ke bawah
      .attr("stroke-dashoffset", 0);

    // Menggambar Node
    const node = g.append("g")
      .selectAll("g")
      .data(root.descendants() as unknown as d3.HierarchyPointNode<ParseTreeNode>[])
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("opacity", 0) // Mulai dengan transparan
      .attr("class", "cursor-pointer");

    // Animasi Node muncul
    node.transition()
      .duration(500)
      .delay(d => d.depth * 500) // Muncul per level (kedalaman)
      .attr("opacity", 1);

    // Lingkaran Node
    node.append("circle")
      .attr("r", 20)
      .attr("fill", d => d.children ? "rgba(236, 72, 153, 0.2)" : "rgba(16, 185, 129, 0.2)") // Pink untuk Variabel, Emerald untuk Terminal
      .attr("stroke", d => d.children ? "rgb(236, 72, 153)" : "rgb(16, 185, 129)")
      .attr("stroke-width", 2)
      .attr("class", "shadow-lg transition-colors hover:fill-opacity-50");

    // Teks Label di dalam Node
    node.append("text")
      .attr("dy", "0.32em")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text(d => d.data.name);

  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
}
