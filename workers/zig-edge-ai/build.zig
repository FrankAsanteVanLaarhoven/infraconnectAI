const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // We build this Zig module securely as a WebAssembly (WASM) library.
    // This allows MEMDEVOS-X to run ultra-low latency AI inference 
    // natively on constrained mobile devices and edge robots.
    const lib = b.addSharedLibrary(.{
        .name = "edge_ai_core",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    b.installArtifact(lib);
}
