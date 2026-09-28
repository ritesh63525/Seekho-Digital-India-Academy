import React, {useEffect, useMemo, useRef} from 'react';

import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {RootStackParamList} from '../../navigation/navigationTypes';
import {useApp} from '../../state/AppContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Splash'
>;

const {width, height} = Dimensions.get('window');

const ART_SIZE = Math.min(width * 0.90, 430);

/*
 * Crop values are relative to seekho-logo.png.
 *
 * x / y / w / h = 0...1
 */

type PieceConfig = {
  key: string;

  x: number;
  y: number;
  w: number;
  h: number;

  fromX: number;
  fromY: number;

  rotation: string;

  delay: number;
};

const PIECES: PieceConfig[] = [
  // top small flag
  {
    key: 'flag',

    x: 0.44,
    y: 0.12,
    w: 0.15,
    h: 0.13,

    fromX: 70,
    fromY: -210,

    rotation: '20deg',

    delay: 0,
  },

  // small upper-left monitor
  {
    key: 'miniLeft',

    x: 0.34,
    y: 0.25,
    w: 0.10,
    h: 0.08,

    fromX: -160,
    fromY: -150,

    rotation: '-30deg',

    delay: 80,
  },

  // gear
  {
    key: 'gear',

    x: 0.29,
    y: 0.29,
    w: 0.16,
    h: 0.17,

    fromX: -230,
    fromY: -10,

    rotation: '-160deg',

    delay: 150,
  },

  // youtube card
  {
    key: 'youtube',

    x: 0.27,
    y: 0.42,
    w: 0.12,
    h: 0.09,

    fromX: -250,
    fromY: 100,

    rotation: '-25deg',

    delay: 230,
  },

  // top right card
  {
    key: 'screen',

    x: 0.56,
    y: 0.27,
    w: 0.14,
    h: 0.13,

    fromX: 240,
    fromY: -110,

    rotation: '32deg',

    delay: 290,
  },

  // orange swoosh
  {
    key: 'orangeWing',

    x: 0.59,
    y: 0.34,
    w: 0.14,
    h: 0.20,

    fromX: 250,
    fromY: 30,

    rotation: '65deg',

    delay: 350,
  },

  // right lower card
  {
    key: 'smallRight',

    x: 0.64,
    y: 0.42,
    w: 0.11,
    h: 0.09,

    fromX: 250,
    fromY: 150,

    rotation: '22deg',

    delay: 410,
  },

  // hat / upper mascot
  {
    key: 'hat',

    x: 0.38,
    y: 0.26,
    w: 0.26,
    h: 0.20,

    fromX: 0,
    fromY: -230,

    rotation: '-12deg',

    delay: 470,
  },

  // laptop / center
  {
    key: 'laptop',

    x: 0.37,
    y: 0.40,
    w: 0.27,
    h: 0.21,

    fromX: 0,
    fromY: 250,

    rotation: '8deg',

    delay: 540,
  },

  // left black body
  {
    key: 'leftBody',

    x: 0.34,
    y: 0.35,
    w: 0.13,
    h: 0.21,

    fromX: -210,
    fromY: 170,

    rotation: '-45deg',

    delay: 600,
  },

  // right black/orange body
  {
    key: 'rightBody',

    x: 0.57,
    y: 0.35,
    w: 0.13,
    h: 0.22,

    fromX: 210,
    fromY: 170,

    rotation: '45deg',

    delay: 660,
  },
];

/* =========================================================
   LOGO PIECE
========================================================= */

type LogoPieceProps = {
  config: PieceConfig;
  progress: Animated.Value;
  masterOpacity: Animated.Value;
};

function LogoPiece({
  config,
  progress,
  masterOpacity,
}: LogoPieceProps) {
  const pieceWidth = ART_SIZE * config.w;
  const pieceHeight = ART_SIZE * config.h;

  const targetLeft = ART_SIZE * config.x;
  const targetTop = ART_SIZE * config.y;

  const translateX = progress.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [
      config.fromX,
      config.fromX * -0.035,
      0,
    ],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [
      config.fromY,
      config.fromY * -0.035,
      0,
    ],
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.72, 1],
    outputRange: [0.25, 1.08, 1],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [0, 1, 1],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [config.rotation, '0deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',

        left: targetLeft,
        top: targetTop,

        width: pieceWidth,
        height: pieceHeight,

        overflow: 'hidden',

        opacity: Animated.multiply(
          opacity,
          masterOpacity,
        ),

        transform: [
          {translateX},
          {translateY},
          {scale},
          {rotate},
        ],

        zIndex: 20,
      }}>

      <Animated.Image
        source={require('../../assets/seekho-logo.png')}
        resizeMode="contain"
        style={{
          position: 'absolute',

          width: ART_SIZE,
          height: ART_SIZE,

          left: -(ART_SIZE * config.x),
          top: -(ART_SIZE * config.y),
        }}
      />
    </Animated.View>
  );
}

/* =========================================================
   MAIN SPLASH
========================================================= */

export default function SplashScreen({
  navigation,
}: Props) {
  const {isAuthenticated} = useApp();

  const screenOpacity =
    useRef(new Animated.Value(1)).current;

  /*
   * Background cinematic entrance
   */

  const sceneOpacity =
    useRef(new Animated.Value(0)).current;

  const floorScale =
    useRef(new Animated.Value(0.15)).current;

  const floorOpacity =
    useRef(new Animated.Value(0)).current;

  /*
   * Pieces
   */

  const pieceAnimations = useMemo(
    () =>
      PIECES.map(
        () => new Animated.Value(0),
      ),
    [],
  );

  const piecesMasterOpacity =
    useRef(new Animated.Value(1)).current;

  /*
   * Final icon crop
   */

  const iconOpacity =
    useRef(new Animated.Value(0)).current;

  const iconScale =
    useRef(new Animated.Value(0.96)).current;

  const iconY =
    useRef(new Animated.Value(8)).current;

  /*
   * SEEKHO DIGITAL
   */

  const wordmarkOpacity =
    useRef(new Animated.Value(0)).current;

  const wordmarkScale =
    useRef(new Animated.Value(0.82)).current;

  const wordmarkY =
    useRef(new Animated.Value(18)).current;

  /*
   * India Academy
   */

  const academyOpacity =
    useRef(new Animated.Value(0)).current;

  const academyY =
    useRef(new Animated.Value(15)).current;

  /*
   * Final complete PNG
   */

  const fullLogoOpacity =
    useRef(new Animated.Value(0)).current;

  const fullLogoScale =
    useRef(new Animated.Value(1)).current;

  /*
   * Shine sweep
   */

  const shineOpacity =
    useRef(new Animated.Value(0)).current;

  const shineX =
    useRef(
      new Animated.Value(-ART_SIZE),
    ).current;

  /*
   * subtle floating at end
   */

  const floatingY =
    useRef(new Animated.Value(0)).current;

  /*
   * sparks
   */

  const sparkOpacity =
    useRef(new Animated.Value(0)).current;

  const sparkScale =
    useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /*
     * Each piece flies in independently.
     */

    const pieceEntrance =
      Animated.parallel(
        PIECES.map(
          (piece, index) =>
            Animated.sequence([
              Animated.delay(
                piece.delay,
              ),

              Animated.spring(
                pieceAnimations[index],
                {
                  toValue: 1,

                  friction: 6,
                  tension: 80,

                  useNativeDriver:
                    true,
                },
              ),
            ]),
        ),
      );

    /*
     * Complete animation.
     */

    const animation =
      Animated.sequence([
        /*
         * 0.0 - 0.35
         * dark background appears
         */

        Animated.parallel([
          Animated.timing(
            sceneOpacity,
            {
              toValue: 1,
              duration: 280,

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            floorOpacity,
            {
              toValue: 1,
              duration: 280,

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            floorScale,
            {
              toValue: 1,
              duration: 350,

              easing:
                Easing.out(
                  Easing.cubic,
                ),

              useNativeDriver:
                true,
            },
          ),
        ]),

        /*
         * 0.35 - approx 2.6
         * logo pieces fly in
         */

        Animated.parallel([
          pieceEntrance,

          Animated.sequence([
            Animated.delay(350),

            Animated.parallel([
              Animated.timing(
                sparkOpacity,
                {
                  toValue: 1,
                  duration: 220,

                  useNativeDriver:
                    true,
                },
              ),

              Animated.spring(
                sparkScale,
                {
                  toValue: 1,

                  friction: 4,
                  tension: 90,

                  useNativeDriver:
                    true,
                },
              ),
            ]),
          ]),
        ]),

        /*
         * assembled symbol replaces all crops
         */

        Animated.parallel([
          Animated.timing(
            iconOpacity,
            {
              toValue: 1,

              duration: 180,

              useNativeDriver:
                true,
            },
          ),

          Animated.spring(
            iconScale,
            {
              toValue: 1,

              friction: 5,
              tension: 100,

              useNativeDriver:
                true,
            },
          ),

          Animated.spring(
            iconY,
            {
              toValue: 0,

              friction: 5,
              tension: 90,

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            piecesMasterOpacity,
            {
              toValue: 0,

              duration: 180,

              useNativeDriver:
                true,
            },
          ),
        ]),

        /*
         * wordmark comes in
         */

        Animated.parallel([
          Animated.timing(
            wordmarkOpacity,
            {
              toValue: 1,

              duration: 260,

              useNativeDriver:
                true,
            },
          ),

          Animated.spring(
            wordmarkScale,
            {
              toValue: 1,

              friction: 6,
              tension: 90,

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            wordmarkY,
            {
              toValue: 0,

              duration: 260,

              easing:
                Easing.out(
                  Easing.cubic,
                ),

              useNativeDriver:
                true,
            },
          ),
        ]),

        /*
         * India Academy
         */

        Animated.parallel([
          Animated.timing(
            academyOpacity,
            {
              toValue: 1,

              duration: 230,

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            academyY,
            {
              toValue: 0,

              duration: 230,

              easing:
                Easing.out(
                  Easing.cubic,
                ),

              useNativeDriver:
                true,
            },
          ),
        ]),

        /*
         * Replace crops with one perfect full logo.
         */

        Animated.parallel([
          Animated.timing(
            fullLogoOpacity,
            {
              toValue: 1,

              duration: 150,

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            iconOpacity,
            {
              toValue: 0,

              duration: 150,

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            wordmarkOpacity,
            {
              toValue: 0,

              duration: 150,

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            academyOpacity,
            {
              toValue: 0,

              duration: 150,

              useNativeDriver:
                true,
            },
          ),
        ]),

        /*
         * light sweep exactly after assembly
         */

        Animated.parallel([
          Animated.sequence([
            Animated.timing(
              shineOpacity,
              {
                toValue: 0.14,

                duration: 80,

                useNativeDriver:
                  true,
              },
            ),

            Animated.delay(370),

            Animated.timing(
              shineOpacity,
              {
                toValue: 0,

                duration: 120,

                useNativeDriver:
                  true,
              },
            ),
          ]),

          Animated.timing(
            shineX,
            {
              toValue:
                ART_SIZE,

              duration: 550,

              easing:
                Easing.out(
                  Easing.cubic,
                ),

              useNativeDriver:
                true,
            },
          ),
        ]),

        /*
         * tiny punch
         */

        Animated.sequence([
          Animated.timing(
            fullLogoScale,
            {
              toValue: 1.035,

              duration: 150,

              useNativeDriver:
                true,
            },
          ),

          Animated.spring(
            fullLogoScale,
            {
              toValue: 1,

              friction: 6,
              tension: 100,

              useNativeDriver:
                true,
            },
          ),
        ]),

        /*
         * reference video holds the logo
         */

        Animated.delay(700),

        /*
         * fade into application
         */

        Animated.parallel([
          Animated.timing(
            screenOpacity,
            {
              toValue: 0,

              duration: 350,

              easing:
                Easing.inOut(
                  Easing.ease,
                ),

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            fullLogoScale,
            {
              toValue: 1.04,

              duration: 350,

              useNativeDriver:
                true,
            },
          ),
        ]),
      ]);

    /*
     * subtle floating only during final stage
     */

    const floatAnimation =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            floatingY,
            {
              toValue: -3,

              duration: 700,

              easing:
                Easing.inOut(
                  Easing.ease,
                ),

              useNativeDriver:
                true,
            },
          ),

          Animated.timing(
            floatingY,
            {
              toValue: 2,

              duration: 700,

              easing:
                Easing.inOut(
                  Easing.ease,
                ),

              useNativeDriver:
                true,
            },
          ),
        ]),
      );

    animation.start(
      ({finished}) => {
        if (!finished) {
          return;
        }

        navigation.reset({
          index: 0,

          routes: [
            {
              name:
                isAuthenticated
                  ? 'Main'
                  : 'Login',
            },
          ],
        });
      },
    );

    /*
     * Start subtle motion later,
     * so assembly remains clean.
     */

    const floatTimer =
      setTimeout(() => {
        floatAnimation.start();
      }, 3500);

    return () => {
      clearTimeout(
        floatTimer,
      );

      animation.stop();
      floatAnimation.stop();
    };
  }, [
    academyOpacity,
    academyY,
    floatingY,
    fullLogoOpacity,
    fullLogoScale,
    iconOpacity,
    iconScale,
    iconY,
    isAuthenticated,
    navigation,
    pieceAnimations,
    piecesMasterOpacity,
    sceneOpacity,
    screenOpacity,
    shineOpacity,
    shineX,
    sparkOpacity,
    sparkScale,
    floorOpacity,
    floorScale,
    wordmarkOpacity,
    wordmarkScale,
    wordmarkY,
  ]);

  return (
    <SafeAreaView
      style={
        styles.safe
      }>

      <StatusBar
        barStyle="light-content"
      />

      <Animated.View
        style={[
          styles.container,
          {
            opacity:
              screenOpacity,
          },
        ]}>

        {/* =================================================
            DARK PREMIUM BACKGROUND
        ================================================= */}

        <Animated.View
          style={[
            styles.scene,
            {
              opacity:
                sceneOpacity,
            },
          ]}>

          <View
            style={
              styles.orangeAmbient
            }
          />

          <View
            style={
              styles.greenAmbient
            }
          />

        </Animated.View>

        {/* =================================================
            SPARKS
        ================================================= */}

        {[
          {
            x: 0.16,
            y: 0.32,
            s: 4,
            c: '#ff7a00',
          },

          {
            x: 0.24,
            y: 0.42,
            s: 3,
            c: '#ff9d00',
          },

          {
            x: 0.12,
            y: 0.53,
            s: 5,
            c: '#ff6d00',
          },

          {
            x: 0.82,
            y: 0.32,
            s: 4,
            c: '#00e676',
          },

          {
            x: 0.88,
            y: 0.44,
            s: 3,
            c: '#00c853',
          },

          {
            x: 0.80,
            y: 0.56,
            s: 5,
            c: '#00e676',
          },

          {
            x: 0.29,
            y: 0.25,
            s: 3,
            c: '#ffb300',
          },

          {
            x: 0.70,
            y: 0.25,
            s: 3,
            c: '#69f0ae',
          },

          {
            x: 0.27,
            y: 0.66,
            s: 3,
            c: '#ff7a00',
          },

          {
            x: 0.73,
            y: 0.65,
            s: 3,
            c: '#00c853',
          },
        ].map(
          (
            spark,
            index,
          ) => (
            <Animated.View
              key={
                index
              }
              style={{
                position:
                  'absolute',

                left:
                  width *
                  spark.x,

                top:
                  height *
                  spark.y,

                width:
                  spark.s,

                height:
                  spark.s,

                borderRadius:
                  spark.s,

                backgroundColor:
                  spark.c,

                opacity:
                  sparkOpacity,

                transform: [
                  {
                    scale:
                      sparkScale,
                  },
                ],

                zIndex: 5,
              }}
            />
          ),
        )}

        {/* =================================================
            LOGO AREA
        ================================================= */}

        <Animated.View
          style={[
            styles.artStage,
            {
              transform: [
                {
                  translateY:
                    floatingY,
                },
              ],
            },
          ]}>

          {/* -----------------------------
              PIECE BY PIECE ASSEMBLY
          ----------------------------- */}

          {PIECES.map(
            (
              piece,
              index,
            ) => (
              <LogoPiece
                key={
                  piece.key
                }
                config={
                  piece
                }
                progress={
                  pieceAnimations[
                    index
                  ]
                }
                masterOpacity={
                  piecesMasterOpacity
                }
              />
            ),
          )}

          {/* -----------------------------
              ASSEMBLED SYMBOL
              Only upper portion of image.
          ----------------------------- */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.symbolCrop,
              {
                opacity:
                  iconOpacity,

                transform: [
                  {
                    translateY:
                      iconY,
                  },

                  {
                    scale:
                      iconScale,
                  },
                ],
              },
            ]}>

            <Animated.Image
              source={require('../../assets/seekho-logo.png')}
              resizeMode="contain"
              style={
                styles.symbolImage
              }
            />

          </Animated.View>

          {/* -----------------------------
              SEEKHO DIGITAL TEXT
          ----------------------------- */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.wordmarkCrop,
              {
                opacity:
                  wordmarkOpacity,

                transform: [
                  {
                    translateY:
                      wordmarkY,
                  },

                  {
                    scale:
                      wordmarkScale,
                  },
                ],
              },
            ]}>

            <Animated.Image
              source={require('../../assets/seekho-logo.png')}
              resizeMode="contain"
              style={
                styles.wordmarkImage
              }
            />

          </Animated.View>

          {/* -----------------------------
              INDIA ACADEMY
          ----------------------------- */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.academyCrop,
              {
                opacity:
                  academyOpacity,

                transform: [
                  {
                    translateY:
                      academyY,
                  },
                ],
              },
            ]}>

            <Animated.Image
              source={require('../../assets/seekho-logo.png')}
              resizeMode="contain"
              style={
                styles.academyImage
              }
            />

          </Animated.View>

          {/* -----------------------------
              FINAL PERFECT COMPLETE LOGO
          ----------------------------- */}

          <Animated.Image
            source={require('../../assets/seekho-logo.png')}
            resizeMode="contain"
            style={[
              styles.fullLogo,
              {
                opacity:
                  fullLogoOpacity,

                transform: [
                  {
                    scale:
                      fullLogoScale,
                  },
                ],
              },
            ]}
          />

          {/* -----------------------------
              LIGHT SWEEP
          ----------------------------- */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.shine,
              {
                opacity:
                  shineOpacity,

                transform: [
                  {
                    translateX:
                      shineX,
                  },

                  {
                    rotate:
                      '14deg',
                  },
                ],
              },
            ]}
          />

        </Animated.View>

        {/* =================================================
            FLOOR SHADOW / LIGHT
        ================================================= */}

        <Animated.View
          style={[
            styles.floorGlow,
            {
              opacity:
                floorOpacity,

              transform: [
                {
                  scaleX:
                    floorScale,
                },
              ],
            },
          ]}>

          <View
            style={
              styles.orangeFloor
            }
          />

          <View
            style={
              styles.greenFloor
            }
          />

        </Animated.View>

      </Animated.View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        '#050706',
    },

    container: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#050706',

      overflow:
        'hidden',
    },

    scene: {
      position:
        'absolute',

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    /* -----------------------------------
       DARK BACKGROUND AMBIENT LIGHTS
    ----------------------------------- */

    orangeAmbient: {
      position:
        'absolute',

      width:
        width * 0.95,

      height:
        width * 0.95,

      borderRadius:
        width,

      left:
        -width * 0.60,

      top:
        height * 0.30,

      backgroundColor:
        'rgba(255,105,0,0.055)',
    },

    greenAmbient: {
      position:
        'absolute',

      width:
        width * 0.95,

      height:
        width * 0.95,

      borderRadius:
        width,

      right:
        -width * 0.60,

      top:
        height * 0.30,

      backgroundColor:
        'rgba(0,220,100,0.045)',
    },

    /* -----------------------------------
       ART STAGE
    ----------------------------------- */

    artStage: {
      width:
        ART_SIZE,

      height:
        ART_SIZE,

      position:
        'relative',

      overflow:
        'hidden',

      zIndex: 15,
    },

    /*
     * upper logo graphic crop
     */

    symbolCrop: {
      position:
        'absolute',

      left: 0,
      top: 0,

      width:
        ART_SIZE,

      height:
        ART_SIZE * 0.61,

      overflow:
        'hidden',

      zIndex: 30,
    },

    symbolImage: {
      position:
        'absolute',

      left: 0,
      top: 0,

      width:
        ART_SIZE,

      height:
        ART_SIZE,
    },

    /*
     * SEEKHO DIGITAL crop
     */

    wordmarkCrop: {
      position:
        'absolute',

      left: 0,

      top:
        ART_SIZE *
        0.605,

      width:
        ART_SIZE,

      height:
        ART_SIZE *
        0.095,

      overflow:
        'hidden',

      zIndex: 31,
    },

    wordmarkImage: {
      position:
        'absolute',

      left: 0,

      top:
        -(ART_SIZE *
          0.605),

      width:
        ART_SIZE,

      height:
        ART_SIZE,
    },

    /*
     * India Academy crop
     */

    academyCrop: {
      position:
        'absolute',

      left: 0,

      top:
        ART_SIZE *
        0.69,

      width:
        ART_SIZE,

      height:
        ART_SIZE *
        0.095,

      overflow:
        'hidden',

      zIndex: 32,
    },

    academyImage: {
      position:
        'absolute',

      left: 0,

      top:
        -(ART_SIZE *
          0.69),

      width:
        ART_SIZE,

      height:
        ART_SIZE,
    },

    /*
     * Final image replaces all crops
     * so there are no seams.
     */

    fullLogo: {
      position:
        'absolute',

      left: 0,
      top: 0,

      width:
        ART_SIZE,

      height:
        ART_SIZE,

      zIndex: 40,
    },

    /* -----------------------------------
       LIGHT SWEEP
    ----------------------------------- */

    shine: {
      position:
        'absolute',

      top:
        ART_SIZE *
        0.12,

      left:
        -(ART_SIZE *
          0.10),

      width:
        ART_SIZE *
        0.16,

      height:
        ART_SIZE *
        0.67,

      borderRadius:
        30,

      backgroundColor:
        'rgba(255,255,255,0.17)',

      zIndex: 50,
    },

    /* -----------------------------------
       FLOOR LIGHT
    ----------------------------------- */

    floorGlow: {
      position:
        'absolute',

      top:
        height * 0.68,

      width:
        width * 0.48,

      height: 4,

      flexDirection:
        'row',

      borderRadius:
        999,

      overflow:
        'hidden',

      zIndex: 5,
    },

    orangeFloor: {
      width: '52%',

      height: 4,

      backgroundColor:
        'rgba(255,122,0,0.72)',
    },

    greenFloor: {
      width: '48%',

      height: 4,

      backgroundColor:
        'rgba(0,230,118,0.62)',
    },
  });