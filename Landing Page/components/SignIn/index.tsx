import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import Footer from '../Footer';
import styles from './SignIn.module.css';

const SignIn = () => {
    // ... existing state and handlers ...

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.mainContent}>
                <motion.div
                    className={styles.signInContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    // ... rest of the existing JSX ...
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default SignIn; 