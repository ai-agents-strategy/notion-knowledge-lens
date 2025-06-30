import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Eye, Globe, ExternalLink, Calendar, Database, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

interface GalleryGraph {
  id: string;
  public_id: string;
  user_id: string;
  nodes: any[];
  connections: any[];
  created_at: string;
  updated_at: string;
  // User profile data
  user_email?: string;
  user_name?: string;
  user_bio?: string;
  user_website?: string;
  user_twitter?: string;
  user_linkedin?: string;
  user_github?: string;
  // Graph metadata
  graph_title?: string;
  graph_description?: string;
  graph_tags?: string[];
}

const fetchGalleryGraphs = async (): Promise<GalleryGraph[]> => {
  const { data, error } = await supabase
    .from('graphs')
    .select(`
      id,
      public_id,
      user_id,
      nodes,
      connections,
      created_at,
      updated_at,
      graph_title,
      graph_description,
      graph_tags,
      profiles!inner(
        user_id,
        user_name,
        user_bio,
        user_website,
        user_twitter,
        user_linkedin,
        user_github
      )
    `)
    .eq('visibility', 'gallery')
    .not('public_id', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(graph => ({
    ...graph,
    user_name: graph.profiles?.user_name,
    user_bio: graph.profiles?.user_bio,
    user_website: graph.profiles?.user_website,
    user_twitter: graph.profiles?.user_twitter,
    user_linkedin: graph.profiles?.user_linkedin,
    user_github: graph.profiles?.user_github,
  }));
};

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  const { data: graphs, isLoading, isError, error } = useQuery({
    queryKey: ['galleryGraphs'],
    queryFn: fetchGalleryGraphs,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const filteredAndSortedGraphs = graphs?.filter(graph => {
    const matchesSearch = !searchTerm || 
      graph.graph_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graph.graph_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graph.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graph.graph_tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterBy === "all" || 
      (filterBy === "recent" && new Date(graph.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesFilter;
  })?.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case "oldest":
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      case "nodes":
        return (b.nodes?.length || 0) - (a.nodes?.length || 0);
      case "connections":
        return (b.connections?.length || 0) - (a.connections?.length || 0);
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getGraphPreviewUrl = (publicId: string) => {
    return `/public/graph/${publicId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Knowledge Graph Gallery
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover and explore public knowledge graphs created by our community. 
              Get inspired by how others organize and visualize their information.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search graphs, creators, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Graphs</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="nodes">Most Nodes</SelectItem>
                  <SelectItem value="connections">Most Connected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading gallery...</span>
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Failed to load gallery</div>
            <p className="text-gray-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        )}

        {filteredAndSortedGraphs && filteredAndSortedGraphs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No graphs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? "Try adjusting your search terms" : "Be the first to share your knowledge graph!"}
            </p>
          </div>
        )}

        {/* Graph Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedGraphs?.map((graph) => (
            <Card key={graph.id} className="group hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {getUserInitials(graph.user_name, graph.user_email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {graph.graph_title || 'Untitled Graph'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        by {graph.user_name || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Graph Description */}
                {graph.graph_description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {graph.graph_description}
                  </p>
                )}

                {/* Graph Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>{graph.nodes?.length || 0} nodes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    <span>{graph.connections?.length || 0} connections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(graph.updated_at)}</span>
                  </div>
                </div>

                {/* Tags */}
                {graph.graph_tags && graph.graph_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {graph.graph_tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {graph.graph_tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{graph.graph_tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* User Bio */}
                {graph.user_bio && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 italic">
                    "{graph.user_bio}"
                  </p>
                )}

                {/* Social Links */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {graph.user_website && (
                      <a
                        href={graph.user_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {graph.user_twitter && (
                      <a
                        href={`https://twitter.com/${graph.user_twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Twitter"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {graph.user_linkedin && (
                      <a
                        href={`https://linkedin.com/in/${graph.user_linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-700 transition-colors"
                        title="LinkedIn"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {graph.user_github && (
                      <a
                        href={`https://github.com/${graph.user_github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="GitHub"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                  </div>

                  <Link to={getGraphPreviewUrl(graph.public_id)}>
                    <Button size="sm" className="group-hover:bg-blue-600 transition-colors">
                      <Eye className="w-4 h-4 mr-2" />
                      View Graph
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More / Pagination could go here */}
        {filteredAndSortedGraphs && filteredAndSortedGraphs.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedGraphs.length} graph{filteredAndSortedGraphs.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;