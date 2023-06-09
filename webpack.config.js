const path = require("path");
const dotenv = require("dotenv").config();
const webpack = require("webpack");
// html 번들링 플러그인
const HtmlWebpackPlugin = require("html-webpack-plugin");
// css파일 추출 플러그인
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 파일 복사 플러그인
const CopyWebpackPlugin = require("copy-webpack-plugin");
// favicon 번들링 플러그인
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { SourceMapDevToolPlugin } = require("webpack");
// 빌드 이전에 남아있는 결과물을 제거하는 플러그인
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  experiments: {
    topLevelAwait: true,
  },
  entry: {
    commons: "./src/js/commons/commons.js",
    reset: "./src/css/reset.css",
    main: "./src/css/main.css",
    allDiary: "./src/js/allDiary/allDiary.js",
    chatting: "./src/js/chatting/chatting.js",
    chattingRoom: "./src/js/chattingRoom/chattingRoom.js",
    diary: "./src/js/diary/diary.js",
    findAccount: "./src/js/findAccount/findAccount.js",
    fortune: "./src/js/fortune/fortune.js",
    home: "./src/js/home/home.js",
    login: "./src/js/login/login.js",
    myDiary: "./src/js/myDiary/myDiary.js",
    mypage: [
      "./src/js/mypage/mypage.js",
      "./src/js/mypage/myEmpathyList.js",
      "./src/js/mypage/myEmpathySwiper.js",
    ],
    signup: "./src/js/signup/signup.js",
    write: "./src/js/write/write.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "img",
            },
          },
        ],
      },
      {
        test: /\.m?js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
  plugins: [
    new SourceMapDevToolPlugin({
      filename: "[file].map",
    }),
    new webpack.DefinePlugin({
      FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
      FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
      FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
      FIREBASE_STORAGE_BUCKET: JSON.stringify(
        process.env.FIREBASE_STORAGE_BUCKET
      ),
      FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(
        process.env.FIREBASE_MESSAGING_SENDER_ID
      ),
      FIREBASE_APP_ID: JSON.stringify(process.env.FIREBASE_APP_ID),
      FIREBASE_MEASUREMENT_ID: JSON.stringify(
        process.env.FIREBASE_MEASUREMENT_ID
      ),
      OPENWEATHERMAP_API_KEY: JSON.stringify(
        process.env.OPENWEATHERMAP_API_KEY
      ),
    }),
    new HtmlWebpackPlugin({
      template: "index.html",
      filename: "index.html",
      chunks: ["reset", "commons", "main", "home"],
      minify: {
        collapseWhitespace: true, // 공백 문자 압축
        removeComments: true, // 주석 제거
        removeEmptyAttributes: true, // 빈 속성 제거
      },
    }),
    new HtmlWebpackPlugin({
      template: "404.html",
      filename: "404.html",
      chunks: ["reset"],
      minify: {
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeEmptyAttributes: true,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/login.html",
      filename: "login.html",
      chunks: ["reset", "login"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/allDiary.html",
      filename: "allDiary.html",
      chunks: ["reset", "commons", "main", "allDiary"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/chatting.html",
      filename: "chatting.html",
      chunks: ["reset", "commons", "main", "chatting"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/chattingRoom.html",
      filename: "chattingRoom.html",
      chunks: ["reset", "commons", "main", "chattingRoom"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/diary.html",
      filename: "diary.html",
      chunks: ["reset", "commons", "main", "diary"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/findAccount.html",
      filename: "findAccount.html",
      chunks: ["reset", "findAccount"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/fortune.html",
      filename: "fortune.html",
      chunks: ["reset", "commons", "main", "fortune"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/myDiary.html",
      filename: "myDiary.html",
      chunks: ["reset", "commons", "main", "myDiary"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/mypage.html",
      filename: "mypage.html",
      chunks: ["reset", "reset", "commons", "main", "mypage"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/signup.html",
      filename: "signup.html",
      chunks: ["reset", "signup"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/template/write.html",
      filename: "write.html",
      chunks: ["reset", "commons", "main", "write"],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[name].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./src/db/db.json"),
          to: path.resolve(__dirname, "dist/db"),
        },
      ],
    }),
    new FaviconsWebpackPlugin({
      logo: "./src/img/favicon.png", // 파비콘 이미지 파일 경로
      outputPath: "./img/", // 생성된 파비콘 파일의 출력 경로
      prefix: "./img/", // 생성된 파비콘 파일의 이름 앞에 추가될 경로 또는 폴더명
      favicons: {
        // 생성될 파비콘 이미지와 관련된 옵션
        appName: "My App", // 앱 이름
        appShortName: "App", // 앱 짧은 이름
        appDescription: "My awesome app", // 앱 설명
        // ... 기타 옵션 ...
      },
    }),
    new CleanWebpackPlugin(),
  ],
  optimization: {
    minimizer: [
      new HtmlMinimizerPlugin({
        minimizerOptions: {
          collapseWhitespace: true, // 공백 문자 압축
          removeComments: true, // 주석 제거
          removeEmptyAttributes: true, // 빈 속성 제거
        },
      }),
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: { drop_console: true },
          output: { comments: false },
        },
      }),
    ],
  },
};
