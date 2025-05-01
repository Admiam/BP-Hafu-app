// assets/__mocks__/react-native.js
const reactNative = jest.requireActual('react-native');

module.exports = {
    ...reactNative,
    StyleSheet: {
        create: styles => styles,
        flatten: jest.fn(),
        hairlineWidth: 1,
        absoluteFill: {},
        absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
        compose: jest.fn((style1, style2) => ({ ...style1, ...style2 })),
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    TextInput: 'TextInput',
    ScrollView: 'ScrollView',
    // Add other components you need
    Dimensions: { get: jest.fn(() => ({ width: 375, height: 812 })) },
    Animated: {
        // Add animation related mocks
        Value: jest.fn(() => ({
            interpolate: jest.fn(() => ({
                interpolate: jest.fn(),
                addListener: jest.fn(),
                removeListener: jest.fn()
            })),
            setValue: jest.fn(),
            addListener: jest.fn(() => ({ remove: jest.fn() })),
            removeListener: jest.fn(),
        })),
        View: 'Animated.View',
        Text: 'Animated.Text',
        ScrollView: 'Animated.ScrollView',
        createAnimatedComponent: jest.fn(comp => comp),
        timing: jest.fn(() => ({ start: jest.fn() })),
        event: jest.fn(() => jest.fn()),
    },
};
