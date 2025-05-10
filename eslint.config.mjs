// eslint.config.js
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // your existing Next.js presets
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // custom rule overrides:
  {
    rules: {
      // on React 17+ you no longer need `import React from 'react'` in every file
      // "react/react-in-jsx-scope": "off",

      // by default ESLint only allows JSX in .jsx/.tsx — extend that to your file types
      "react/jsx-filename-extension": [
        1,
        { extensions: [".js", ".jsx", ".ts", ".tsx"] }
      ],
    },
    settings: {
      // ensure the import/resolver knows about TS extensions
      "import/resolver": {
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] }
      }
    }
  }
];