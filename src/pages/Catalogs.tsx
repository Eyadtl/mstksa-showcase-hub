import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Catalogs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Placeholder catalog data
  const catalogs = [
    { id: 1, title: "Steel Beams & Structures", category: "Structural Steel" },
    { id: 2, title: "Metal Fabrication", category: "Fabrication" },
    { id: 3, title: "Industrial Components", category: "Components" },
    { id: 4, title: "Custom Steel Solutions", category: "Custom" },
  ];

  const filteredCatalogs = catalogs.filter((catalog) =>
    catalog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    catalog.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 brand-serif">
            Product Catalogs
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Explore our comprehensive range of steel products and solutions
          </p>

          {/* Search */}
          <div className="relative mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search catalogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCatalogs.map((catalog) => (
              <div
                key={catalog.id}
                className="group cursor-pointer p-6 bg-card rounded-xl border border-border hover:border-primary transition-smooth hover:shadow-red"
              >
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground brand-serif">
                    MST
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-fast">
                  {catalog.title}
                </h3>
                <p className="text-sm text-muted-foreground">{catalog.category}</p>
              </div>
            ))}
          </div>

          {filteredCatalogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No catalogs found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalogs;
