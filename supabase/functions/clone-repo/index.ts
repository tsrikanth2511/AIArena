/// <reference types="https://deno.land/x/deno@v1.37.1/mod.d.ts" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// File extensions to prioritize
const PRIORITY_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
  '.rb', '.php', '.go', '.rs', '.swift', '.kt', '.scala', '.md', '.txt'
]

// Files to always include
const IMPORTANT_FILES = [
  'README.md', 'README.txt', 'CONTRIBUTING.md', 'LICENSE',
  'package.json', 'requirements.txt', 'setup.py', 'pom.xml',
  'build.gradle', 'Cargo.toml', 'go.mod'
]

// Files/directories to skip
const SKIP_PATTERNS = [
  'node_modules', 'dist', 'build', '.git', '__pycache__',
  'target', 'vendor', '.idea', '.vscode', '*.min.js',
  '*.bundle.js', '*.map', '*.d.ts'
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { repoUrl, folderName } = await req.json()
    
    // Get GitHub token from environment variable
    const githubToken = Deno.env.get('GITHUB_TOKEN')
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN is not configured in the Edge Function environment')
    }

    // Create Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('PROJECT_ANON_KEY') ?? ''
    )

    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }
    const [, owner, repo] = match

    // Function to recursively get repository contents
    const getRepoContents = async (path: string = ''): Promise<any[]> => {
      const contentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      console.log('Fetching contents from:', contentsUrl)
      
      const response = await fetch(contentsUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubToken}`,
          'User-Agent': 'Supabase-Edge-Function'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('GitHub API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: contentsUrl,
          response: errorText
        })
        throw new Error(`Failed to fetch repository contents: ${response.statusText}`)
      }

      const contents = await response.json()
      const results: any[] = []

      for (const item of contents) {
        const fullPath = path ? `${path}/${item.name}` : item.name

        // Skip if matches skip patterns
        if (SKIP_PATTERNS.some(pattern => 
          pattern.includes('*') 
            ? new RegExp(pattern.replace('*', '.*')).test(fullPath)
            : fullPath.includes(pattern)
        )) {
          continue
        }

        if (item.type === 'file') {
          // Skip large files
          if (item.size > 100000) { // 100KB limit
            continue
          }

          // Calculate priority
          let priority = 0
          if (IMPORTANT_FILES.includes(item.name)) {
            priority = 3
          } else if (PRIORITY_EXTENSIONS.some(ext => item.name.endsWith(ext))) {
            priority = 2
          } else {
            priority = 1
          }

          try {
            const fileResponse = await fetch(item.download_url, {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'User-Agent': 'Supabase-Edge-Function'
              }
            })
            
            if (!fileResponse.ok) continue

            const content = await fileResponse.text()
            results.push({
              type: 'file',
              path: fullPath,
              name: item.name,
              content,
              priority
            })
          } catch (error) {
            console.warn(`Failed to fetch file ${fullPath}:`, error)
          }
        } else if (item.type === 'dir') {
          // Recursively get contents of subdirectory
          const subContents = await getRepoContents(fullPath)
          results.push(...subContents)
        }
      }

      return results
    }

    // Get all repository contents
    const repositoryContents = await getRepoContents()
    console.log(`Found ${repositoryContents.length} files in repository`)

    // Sort files by priority and limit total size
    repositoryContents.sort((a, b) => b.priority - a.priority)
    
    let totalSize = 0
    const MAX_SIZE = 500000 // 500KB total limit
    const selectedFiles = repositoryContents.filter(file => {
      const fileSize = new TextEncoder().encode(file.content).length
      if (totalSize + fileSize <= MAX_SIZE) {
        totalSize += fileSize
        return true
      }
      return false
    })

    // Upload selected files to Supabase storage
    for (const file of selectedFiles) {
      // Create a flat structure by encoding the path in the filename
      const safePath = file.path.replace(/\//g, '_')
      const storagePath = `${folderName}/${safePath}`
      console.log('Uploading file:', storagePath)
      
      const content = new TextEncoder().encode(file.content)
      const { error: uploadError } = await supabaseClient.storage
        .from('repositories')
        .upload(storagePath, content, {
          contentType: 'text/plain',
          upsert: true,
          metadata: {
            originalPath: file.path,
            originalName: file.name
          }
        })

      if (uploadError) {
        console.error('Error uploading file:', storagePath, uploadError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        folderName,
        fileCount: selectedFiles.length,
        totalSize,
        message: `Successfully processed ${selectedFiles.length} relevant files`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in clone-repo function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 