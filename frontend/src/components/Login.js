import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Col, Button, Row, Container, Card, Form, Alert, Spinner } from 'react-bootstrap';
import { Lock, Envelope } from 'react-bootstrap-icons';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();

    const Auth = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`http://localhost:5000/users/auth/login`, {
                email: email,
                password: password,
            });
            
            window.localStorage.setItem('token', response.data.token);
            navigate('/', { replace: true });
            
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg || 'Invalid credentials');
            } else if (error.request) {
                setMsg('No response from server');
            } else {
                setMsg('Request failed');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Row className="justify-content-center w-100">
                <Col md={8} lg={6} xl={5}>
                    <Card className="shadow-sm p-4">
                        <Card.Body>
                            <h2 className="text-center mb-4">Login</h2>
                            
                            {msg && (
                                <Alert variant="danger" onClose={() => setMsg('')} dismissible className="mb-4">
                                    {msg}
                                </Alert>
                            )}
                            
                            <Form noValidate validated={validated} onSubmit={Auth}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <Envelope className="me-2" />
                                        Email Address
                                    </Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Enter your email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid email.
                                    </Form.Control.Feedback>
                                </Form.Group>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        <Lock className="me-2" />
                                        Password
                                    </Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Enter password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required
                                        minLength={6}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Password must be at least 6 characters.
                                    </Form.Control.Feedback>
                                </Form.Group>
                                
                                <div className="d-grid">
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        size="lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Signing in...
                                            </>
                                        ) : 'Login'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}