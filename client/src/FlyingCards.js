import React from "react";
import { motion } from "framer-motion";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";


const cards = [
    {
      id: 1,
      title: "Explore Nature",
      description: "Discover beautiful landscapes.",
      image: "https://source.unsplash.com/300x200/?nature",
      link: "/nature",
    },
    {
      id: 2,
      title: "Tech Innovations",
      description: "Latest advancements in technology.",
      image: "https://source.unsplash.com/300x200/?technology",
      link: "/technology",
    },
    {
      id: 3,
      title: "Healthy Living",
      description: "Tips for a healthier lifestyle.",
      image: "https://source.unsplash.com/300x200/?health",
      link: "/health",
    },
    {
      id: 4,
      title: "Travel the World",
      description: "Amazing places to visit.",
      image: "https://source.unsplash.com/300x200/?travel",
      link: "/travel",
    },
  ];

const cardVariants = {
  hidden: (direction) => ({
    opacity: 0,
    x: direction === "left" ? -200 : direction === "right" ? 200 : 0,
    y: direction === "top" ? -200 : direction === "bottom" ? 200 : 0,
    scale: 0.5,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};



const FlyingCards = () => {
    return (
        <Container className="mt-5">
          <Row className="justify-content-center">
            {cards.map((card, index) => (
              <Col md={6} lg={3} key={card.id} className="mb-4">
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, rotate: -5 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
                  whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.3)" }}
                >
                  <Card className="shadow-lg rounded-lg overflow-hidden">
                    <Card.Img variant="top" src={card.image} alt={card.title} />
                    <Card.Body>
                      <Card.Title>{card.title}</Card.Title>
                      <Card.Text>{card.description}</Card.Text>
                      <Link to={card.link} className="btn btn-primary">
                        Learn More
                      </Link>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
  );
};

export default FlyingCards;