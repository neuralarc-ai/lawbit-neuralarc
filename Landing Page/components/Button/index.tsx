import React, { ReactNode } from "react";
import cn from "classnames";
import styles from "./Button.module.sass";

type ButtonProps = {
    className?: string;
    title: ReactNode;
    href?: string;
    onClick?: () => void;
};

const Button = ({ className, title, href, onClick, ...props }: ButtonProps) => {
    const CreatedTag = href ? "a" : "button";

    return (
        <CreatedTag
            className={cn(styles.button, className)}
            href={href}
            onClick={onClick}
            rel={href ? "noopener noreferrer" : undefined}
            {...props}
        >
            <span className={styles.title}>{title}</span>
            <span className={styles.circle}></span>
        </CreatedTag>
    );
};

export default Button;
