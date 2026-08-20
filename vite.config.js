import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({

  plugins:[react()],

  build:{

    outDir:"dist",

    sourcemap:false,

    minify:"esbuild",

    chunkSizeWarningLimit:1000,

    rollupOptions:{

      output:{

        manualChunks:{

          react:["react","react-dom"],

          mui:[
            "@mui/material",
            "@mui/icons-material"
          ],

          fabric:["fabric"]

        }

      }

    }

  },

  server:{
    port:5173
  }

});