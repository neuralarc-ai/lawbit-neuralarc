import cn from "classnames";
import * as Accordion from '@radix-ui/react-accordion';
import Button from "@/components/Button";
import Item from "./Item";
import styles from "./Faq.module.sass";

import { faq } from "@/mocks/faq";

type FaqProps = {};

const Faq = ({}: FaqProps) => {
    return (
        <div className={cn("section", styles.faq)}>
            <div className={cn("container", styles.container)}>
                <div className={styles.wrap}>
                    <div className={cn("h2", styles.title)}>
                        Frequently asked questions
                    </div>
                    <div className={styles.info}>
                        Contact us via support if you have any more questions.
                    </div>
                    <Button
                        className={styles.button}
                        title="Contact us"
                        href="https://ui8.net/ui8/products/bento-cards-simplelist"
                    />
                </div>
                <Accordion.Root type="single" collapsible className={styles.list}>
                    {faq.map((item) => (
                        <Item item={item} key={item.id} />
                    ))}
                </Accordion.Root>
            </div>
        </div>
    );
};

export default Faq;
