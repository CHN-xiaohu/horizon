import dayjs from "dayjs";
import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import en from "./translation/en.json";
import ru from "./translation/ru.json";
import "dayjs/locale/ru";

const lng = document.querySelector("html").lang;

dayjs.locale("ru");

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en,
            ru,
        },
        lng,
        fallbackLng: "en",
    });
