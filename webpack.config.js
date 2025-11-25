import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => { 
  const isProduction = argv.mode === 'production';
const commonModule = {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { esmodules: true },
                modules: false
              }
            ]
          ]
        }
      }
    }
  ]
};

return [
    {
      name: 'client',
      entry: [
       './client/startClient.js'
      ],
      mode: isProduction ? 'production' : 'development',
      target: ['web', 'es2020'],
      output: {
        filename: 'client.js',
        path: path.resolve(__dirname, 'dist/client'),
        clean: true,
        module: true,
      },
      experiments: {
        outputModule: true
      },
      resolve: {
        extensions: ['.js', '.html'],
        alias: {
          '@classes': path.resolve(__dirname, 'client/classes'),
          '@startClient': path.resolve(__dirname, 'client/startClient.js'),
          '@interactions': path.resolve(__dirname, 'client/classes/Interactions'),
          '@notifications': path.resolve(__dirname, 'client/classes/Notifications'),
          '@config': path.resolve(__dirname, 'client/config')
        }
      },
      externalsType: 'module',
      externals: {
        'alt-client': 'alt-client',
        'natives': 'natives',
        'alt-shared': 'alt-shared'
      },
      module: commonModule,
      optimization: {
        minimize: isProduction,
        splitChunks: false
      },
    
      plugins: [
        new webpack.ProvidePlugin({
          InteractionType: [
            path.resolve(__dirname, 'shared/Consts.js'),
            'InteractionType'
          ],
          //глобальные функции из файла utilities.js
          wait: [
            path.resolve(__dirname, 'client/utilities/utilities.js'),
            'wait'
          ],
          drawNotification: [
            path.resolve(__dirname, 'client/utilities/utilities.js'),
            'drawNotification'
          ],
        }),
      ],
    
     devtool: false
    },
    {
      name: 'server',
      entry: [        
        './server/startServer.js',
      ],
      mode: isProduction ? 'production' : 'development',
      target: 'node16',
      output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist/server'),
        clean: true,
        module: true,
        library: { type: 'module' }
      },
      experiments: {
        outputModule: true
      },
      resolve: {
        extensions: ['.js'],
        alias: {
        }
      },
      externalsType: 'module',
      externals: {
        'alt-server': 'alt-server',
        'alt:chat' : 'alt:chat',
        'alt-shared': 'alt-shared'
      },
      module: commonModule,
      optimization: {
        minimize: isProduction
      },
    
      plugins: [
        new webpack.ProvidePlugin({
          InteractionType: [
            path.resolve(__dirname, 'shared/Consts.js'),
            'InteractionType'
          ]
        }),
      ],
    
      devtool: false
    }
  ];
};