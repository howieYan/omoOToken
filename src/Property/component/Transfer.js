import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    AsyncStorage,
} from 'react-native';
import Utils from "../../Component/Utils";
import {TextInputLayout} from 'rn-textinputlayout';
// import RichScanCom from "../../My/MyComponent/Linkman/RichScan";
import {Loading} from "../../Component/Loading";

export default class Transfer extends React.Component {
    static navigationOptions = ({navigation}) => ({
        headerTitle: navigation.state.params.name,
        headerTintColor: '#4e5d6f',
        headerTitleStyle:{
            flex:1,
            textAlign: 'center'
        },
        headerRight: <View/>,
    })
    constructor(props) {
        super(props);
        this.state= {
            address: '',
            number: '',
            pmPwd: '',
            isPmPwd: /^[a-zA-Z0-9]{6,20}$/,
            data: {},
            language: {},
            transferList: {},
            transferType: ''
        }
    }
    componentDidMount () {
        this.LoadData();
    }
    async LoadData() {
        try {
            this.setState({
                language: this.props.navigation.state.params.language,

                address: this.props.navigation.state.params.address
            });
            Loading.show(this.state.language.PrivacyPolicy_Loading_show);
            let lang = await AsyncStorage.getItem('lang');
            let pmId = await AsyncStorage.getItem('pmId');
            let formData = new FormData();
            formData.append("pmId", pmId);
            formData.append("lang", lang);
            let resultList = await Utils.postJSON(Utils.size.url + '/api/account/getInfo', formData);
            let transferList = await Utils.postJSON(Utils.size.url + '/api/property/transferType');
            if (Number(resultList.code) === 0) {
                this.setState({
                    data: resultList.result,
                    transferList: transferList.result
                })
                Loading.hidden();
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    render() {
        return (
            <View style={styles.content}>
                <View style={styles.editMain}>
                    <View style={styles.editHeader}>
                        {this.RenderHeader()}
                    </View>
                    <View style={styles.editMainMomy}>
                        <TextInputLayout
                            style={styles.inputLayout}>
                            <TextInput
                                style={styles.textInput}
                                placeholder={this.state.language.app_transfer_input_one}
                                onChangeText={(text) =>this.setState({address: text})}
                                value={this.state.address}
                            />
                        </TextInputLayout>
                        <TouchableOpacity activeOpacity={0.5} onPress={this.openRchScan.bind(this)}>
                            <View style={{paddingRight: 10,paddingTop:10,}}>
                                <Image source={require('../../Image/SweepSao.png')} style={styles.headerRightImg}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.editMainMomy}>
                        <TextInputLayout
                            style={styles.inputLayout}>
                            <TextInput
                                style={styles.textInput}
                                placeholder={this.state.language.app_transfer_input_two}
                                onChangeText={(text) =>this.setState({number: text})}
                                value={this.state.number}
                            />
                        </TextInputLayout>
                    </View>
                    <View style={styles.editMainMomy}>
                        <TextInputLayout
                            style={styles.inputLayout}
                            checkValid={t => this.state.isPmPwd.test(t)}>
                            <TextInput
                                style={styles.textInput}
                                placeholder={this.state.language.reg_new_button_input_two}
                                onChangeText={(text) =>this.setState({pmPwd: text})}
                                value={this.state.pmPwd}
                                secureTextEntry={true}/>
                        </TextInputLayout>

                    </View>
                    <Text style={{paddingTop: 10,paddingBottom: 10}}>{this.state.language.app_transfer_text_one}:{this.state.data.pm_amount}</Text>
                    <Text style={{paddingTop: 10,paddingBottom: 10}}>{this.state.language.app_transfer_text_two}:{this.state.data.balance}</Text>
                    <TouchableOpacity activeOpacity={0.8} onPress={this.onOkButton.bind(this)}>
                        <View style={styles.BottomBotton} >
                            <Text style={styles.BottomBottonText}>{this.state.language.app_changePwd_title_right}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    RenderHeader () {
        let list = [];
        let Array = this.state.transferList.list;
        if (Array) {
            Array.map((v, i) => {
                list.push(
                    <TouchableOpacity activeOpacity={0.8} onPress={this.onSelecd.bind(this, v)} key={i}>
                        <View style={styles.editSweep} style={{width: Utils.size.width / Array.length, flexDirection: 'row', alignItems: 'center',paddingLeft:10,}}>
                            <Image source={this.state.transferType !== v.tt_id ? require('../../Image/Options.png'): require('../../Image/OptionsActive.png')} style={{width: 20,height: 20,}}/>
                            <Text>{v.tt_name}</Text>
                        </View>
                    </TouchableOpacity>
                )
            })
        }
        return list;
    }
    onSelecd (record) {
        this.setState({
            transferType: record.tt_id
        })
    }
    openRchScan () {
        this.props.navigation.navigate('RichScanCom',
            {
                name: this.state.language.app_property_Flickinga,
                language: this.state.language,
                data: this.state.data,
                RecodeLoadData: (record) => {
                    this.setState({
                        address: record
                    })
                }
            }
        )
    }
    // 返回
    onBackButton () {
        Loading.hidden();
        this.props.navigation.state.params.ReceiveCode()
        this.props.navigation.goBack()
    }
    onOkButton () {
        if (!this.state.transferType) {
            Loading.Toast(this.state.language.toast_Transfer_transferType);
        } else if (!this.state.address) {
            Loading.Toast(this.state.language.toast_Transfer_address);
        } else if (!this.state.number) {
            Loading.Toast(this.state.language.toast_Transfer_number);
        } else if (!this.state.pmPwd) {
            Loading.Toast(this.state.language.api_auth_pwd_required);
        } else {
            this.editPwd();
        }
    }
    async editPwd () {
        try {
            let lang = await AsyncStorage.getItem('lang');
            let pmId = await AsyncStorage.getItem('pmId');
            let formDataList = new FormData();
            formDataList.append("pmId", pmId);
            formDataList.append("lang", lang);
            let resultList = await Utils.postJSON(Utils.size.url + '/api/account/getInfo', formDataList);
            let formData = new FormData();
            formData.append("pmType", this.state.transferType);
            formData.append("address", this.state.address);
            formData.append("pmCode", resultList.result.pm_code);
            formData.append("pmPwd", this.state.pmPwd);
            formData.append("number", this.state.number);
            formData.append("lang", lang);
            let data = await Utils.postJSON(Utils.size.url + '/api/property/transfer' , formData);
            console.log(data);
            if (Number(data.code) === 0) {
                Loading.Toast(this.state.language.toast_Transfer_code_true);
                this.onBackButton();
            } else {
                Loading.hidden();
                Loading.Toast(data.message);
            }
        }
        catch (e) {
            console.log(e);
        }
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    editHeader: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    editSweep: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // 内容
    editMain: {
        width: Utils.size.width,
        paddingLeft: 10,
        paddingTop: 10,
        paddingRight: 10,
    },
    editMainMomy: {
        flexDirection: 'row',
        paddingTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // borderBottomWidth: Utils.size.os === 'ios' ? 1 : 0,
        // borderBottomColor: '#ececec',
    },
    inputLayout: {
        flex: 1,
    },
    textInput: {
        width: Utils.size.width- 20,
        height: 40,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        fontSize: Utils.setSpText(14),
    },
    BottomBotton: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#36b9c8',
        height: 40,
        borderRadius: 3,
    },
    BottomBottonText: {
        color: '#fff',
        fontSize: Utils.setSpText(17),
    },
    headerRightImg: {
        width: 20,
        height: 20,
    },
});

