import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated, TextInput, WebView, AsyncStorage,
} from 'react-native';
import Utils from "../../Component/Utils";
import {Loading} from "../../Component/Loading";

export default class Usage extends React.Component {
    static navigationOptions = ({navigation}) => ({
        headerTitle: navigation.state.params.name,
        headerTintColor: '#4e5d6f',
        headerTitleStyle:{
            flex:1,
            textAlign: 'center'
        },
        headerRight: <View />,

    })
    constructor(props) {
        super(props);
        this.state = {
            list: {},
        }
    }
    componentDidMount () {
        this.LoadAsync();
    }
    async LoadAsync () {
        try {
            let lang = await AsyncStorage.getItem('lang');
            let formData = new FormData();
            formData.append("lang", lang);
            let result = await Utils.postJSON(Utils.size.url + '/api/account/duty', formData);
            this.setState({
                list: result.result
            })
            Loading.hidden();
        }
        catch (e) {
            console.log(e);
        }
    }
    render() {
        return (
            <View style={styles.content}>
                <WebView bounces={false}
                         originWhitelist={['*']}
                         scalesPageToFit={Utils.size.os === 'ios' ? false : true}
                         source={{html: this.state.list.new_content,  baseUrl: ''}}
                         style={{width: Utils.size.width, height: Utils.size.height}}>
                </WebView>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
});

