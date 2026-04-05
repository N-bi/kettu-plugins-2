// v3
import { findByProps } from "@revenge-mod/modules/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";

const Tag = findByProps("getBotLabel");

function patchTag() {
    return after("default", Tag, ([{ text, textColor, backgroundColor }], ret) => {
        const label = findInReactTree(ret, (c) => typeof c.props.children === "string");
        if (text) label.props.children = text;
        if (textColor) label.props.style.push({ color: textColor });
        if (backgroundColor) ret.props.style.push({ backgroundColor });
    });
}

export default patchTag;
