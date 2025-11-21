"use client";

export function TableBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at center, var(--theme-table-felt-start) 0%, var(--theme-table-felt-end) 100%)",
      }}
    >
      {/* Felt texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml,%3Csvg width="200" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="turbulence" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="200" height="200" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E\')',
        }}
      />
      {/* Table edge - wood grain */}
      <div
        className="absolute top-0 left-0 right-0 h-22 border-b-4"
        style={{
          background: `linear-gradient(to bottom, var(--theme-table-edge), var(--theme-table-edge))`,
          borderColor: "var(--theme-table-edge-accent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-22 border-t-4"
        style={{
          background: `linear-gradient(to top, var(--theme-table-edge), var(--theme-table-edge))`,
          borderColor: "var(--theme-table-edge-accent)",
        }}
      />
    </div>
  );
}
