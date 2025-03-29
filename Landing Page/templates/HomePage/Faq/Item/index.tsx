import { useState } from "react";
import cn from "classnames";
import * as Accordion from '@radix-ui/react-accordion';
import styles from "./Item.module.sass";

type ItemProps = {
    item: {
        id: string;
        title: string;
        content: string;
    };
};

const Item = ({ item }: ItemProps) => {
    return (
        <Accordion.Item value={item.id} className={styles.item}>
            <Accordion.Header>
                <Accordion.Trigger className={styles.head}>
                    <div className={styles.title}>{item.title}</div>
                    <div className={styles.plus}>
                        <span></span>
                        <span></span>
                    </div>
                </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.body}>
                {item.content}
            </Accordion.Content>
        </Accordion.Item>
    );
};

export default Item;
